#!/usr/bin/env python3

import argparse
import json
import os
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urljoin
from urllib.request import urlopen


def get_json(url):
    try:
        with urlopen(url, timeout=30) as response:
            return json.load(response)
    except (HTTPError, URLError, json.JSONDecodeError) as exc:
        print(f"请求失败: {exc}")
        return None


def search_cdnjs_library(library_name):
    search_url = f"https://api.cdnjs.com/libraries?search={quote(library_name, safe='')}&fields=version,latest,fileType"
    return get_json(search_url)

def get_library_info(library_name):
    api_url = f"https://api.cdnjs.com/libraries/{quote(library_name, safe='')}?fields=versions,assets"
    return get_json(api_url)

def download_file(url, local_filename):
    try:
        os.makedirs(os.path.dirname(local_filename), exist_ok=True)
        with urlopen(url, timeout=30) as response, open(local_filename, 'wb') as f:
            while chunk := response.read(8192):
                f.write(chunk)
        print(f"文件已下载: {local_filename}")
        return True
    except (HTTPError, URLError, OSError) as e:
        print(f"下载文件时出错: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='从CDNJS下载前端库')
    parser.add_argument('library', help='库名称 (如: jquery)')
    parser.add_argument('version', help='版本号 (如: 3.6.0)')
    parser.add_argument('-f', '--file', help='指定文件名 (默认下载所有文件)')
    parser.add_argument('-o', '--output', default='./', help='输出目录 (默认: 当前目录)')
    
    args = parser.parse_args()
    
    library_info = get_library_info(args.library)
    if not library_info:
        print(f"找不到库: {args.library}")
        return 1
    
    if args.version not in library_info.get('versions', []):
        print(f"版本 {args.version} 不存在于库 {args.library} 中")
        print(f"可用版本: {', '.join(library_info.get('versions', []))}")
        return 1
    
    library_url = quote(args.library, safe='')
    version_url = quote(args.version, safe='')
    base_url = f"https://cdnjs.cloudflare.com/ajax/libs/{library_url}/{version_url}/"
    
    assets_url = f"https://api.cdnjs.com/libraries/{library_url}/{version_url}?fields=files"
    assets_response = get_json(assets_url)
    if assets_response is None:
        return 1

    files = assets_response.get('files', [])
    
    cdnjs_path = os.path.join(args.output, args.library, args.version)
    os.makedirs(cdnjs_path, exist_ok=True)
    
    if args.file:
        if args.file in files:
            file_url = urljoin(base_url, quote(args.file, safe='/'))
            local_path = os.path.join(cdnjs_path, args.file)
            return 0 if download_file(file_url, local_path) else 1
        else:
            print(f"文件 {args.file} 不存在于该版本中")
            print(f"可用文件: {', '.join(files)}")
            return 1
    else:
        print(f"下载 {args.library}@{args.version} 的所有文件到 {cdnjs_path}")
        success = True
        for file in files:
            file_url = urljoin(base_url, quote(file, safe='/'))
            local_path = os.path.join(cdnjs_path, file)
            print(f"下载: {file}")
            success = download_file(file_url, local_path) and success
        return 0 if success else 1

if __name__ == "__main__":
    raise SystemExit(main() or 0)
