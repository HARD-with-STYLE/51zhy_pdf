#!/usr/bin/env python
# coding:utf-8
from PyPDF2 import PdfFileMerger, PdfFileReader, PdfFileWriter
import os
import sys
import json
import requests
import urllib
import random
import time

deviceToken = 'ebook9D572D5B4B8F3BEC28589B10B07F8EC2'


def add_bookmarks(path, file_dir, data=None):
    if not data:
        with open(file_dir + '\\bookmark.json', 'rb') as f:
            bookmarks = json.load(f)['Data']
    else:
        bookmarks = data['Data']
    book = PdfFileReader(path, strict=False)
    pdf = PdfFileWriter()
    for i in range(book.getNumPages()):
        pdf.addPage(book.getPage(i))
    mark_list = []
    for bookmark in bookmarks:

        parent = None
        if bookmark['ParentId'] != 0:
            for mark in mark_list:
                if mark['id'] == bookmark['ParentId']:
                    parent = mark['bookmark']
                    break
        mark = pdf.addBookmark(bookmark['Title'], bookmark['Page'], parent=parent)
        mark_list.append({
            'id': bookmark['Id'],
            'bookmark': mark
        })

    with open(path[0:path.rfind('.')] + '.bookmark.pdf', 'wb') as fout:
        try:
            pdf.write(fout)
        except:
            print(path[0:path.rfind('.')] + "格式有误")
            pass


def file_name_walk(file_dir):
    for root, dirs, files in os.walk(file_dir):
        if 'bookmark.json' in files:
            files.remove('bookmark.json')
        files.sort(key=lambda x: int(x[x.rfind('-') + 1:][:-4]))
        file_list = [file_dir + '\\' + file for file in files]
        merger = PdfFileMerger(strict=False)
        for pdf in file_list:
            merger.append(pdf)
        path = files[0][:files[0].rfind('-')] + '.pdf'
        merger.write(path)
        add_bookmarks(path, file_dir)


def remake_bookmark(file_dir):
    for root, dirs, files in os.walk(file_dir):
        for file in files:
            path = file
            if 'bookmark' in path or os.path.exists(file_dir + '\\' + path[0:path.find('.')] + '.bookmark.pdf'):
                continue
            _id = path[0:path.find('-')]
            list_data = {
                'AccessToken': 'null',
                'DeviceToken': deviceToken,
                'ApiName': '/tableofcontent/list',
                'BridgePlatformName': 'phei_yd_web',
                'random': random.random(),
                'AppId': 3,
                'objectId': _id,
            }
            res = requests.get(
                f'https://bridge.51zhy.cn/transfer/tableofcontent/list?{urllib.parse.urlencode(list_data)}')
            add_bookmarks(file_dir + '\\' + path, None, res.json())
            print(path + '书签添加完成')
            time.sleep(5)


if __name__ == '__main__':
    if len(sys.argv) > 1:
        file_name_walk(sys.argv[1])
