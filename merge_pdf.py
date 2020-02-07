#!/usr/bin/env python
# coding:utf-8
from PyPDF2 import PdfFileMerger, PdfFileReader, PdfFileWriter
import os
import sys
import json


def add_bookmarks(path, file_dir):
    with open(file_dir + '\\bookmark.json', 'rb') as f:
        bookmarks = json.load(f)['Data']
    book = PdfFileReader(path)
    pdf = PdfFileWriter()
    pdf.cloneDocumentFromReader(book)
    for bookmark in bookmarks:
        try:
            pdf.addBookmark(bookmark['Title'], bookmark['Page'] - 1)
        except:
            break
    try:
        with open(path[0:path.rfind('.')] + '.bookmark.pdf', 'wb') as fout:
            pdf.write(fout)
    except FileNotFoundError:
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


if __name__ == '__main__':
    if len(sys.argv) > 1:
        file_name_walk(sys.argv[1])
