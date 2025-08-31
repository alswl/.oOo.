import requests
import argparse
import os
from urllib.parse import urljoin

def search_cdnjs_library(library_name):
    """
    搜索 CDNJS 上的库信息
    """
    search_url = f"https://api.cdnjs.com/libraries?search={library_name}&fields=version,latest,fileType"
    try:
        response = requests.get(search_url)
        response.raise_for_status()
        data = response.json()
        return data
    except requests.exceptions.RequestException as e:
        print(f"搜索库时出错: {e}")
        return None

def get_library_info(library_name):
    """
    获取指定库的详细信息
    """
    api_url = f"https://api.cdnjs.com/libraries/{library_name}?fields=versions,assets"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"获取库信息时出错: {e}")
        return None

def download_file(url, local_filename):
    """
    下载文件到本地
    """
    try:
        # 确保父目录存在
        os.makedirs(os.path.dirname(local_filename), exist_ok=True)
        
        with requests.get(url, stream=True) as response:
            response.raise_for_status()
            with open(local_filename, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
        print(f"文件已下载: {local_filename}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"下载文件时出错: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='从CDNJS下载前端库')
    parser.add_argument('library', help='库名称 (如: jquery)')
    parser.add_argument('version', help='版本号 (如: 3.6.0)')
    parser.add_argument('-f', '--file', help='指定文件名 (默认下载所有文件)')
    parser.add_argument('-o', '--output', default='./', help='输出目录 (默认: 当前目录)')
    
    args = parser.parse_args()
    
    # 获取库信息
    library_info = get_library_info(args.library)
    if not library_info:
        print(f"找不到库: {args.library}")
        return
    
    # 检查版本是否存在
    if args.version not in library_info.get('versions', []):
        print(f"版本 {args.version} 不存在于库 {args.library} 中")
        print(f"可用版本: {', '.join(library_info.get('versions', []))}")
        return
    
    # 构建下载URL
    base_url = f"https://cdnjs.cloudflare.com/ajax/libs/{args.library}/{args.version}/"
    
    # 获取文件列表
    assets_url = f"https://api.cdnjs.com/libraries/{args.library}/{args.version}?fields=files"
    assets_response = requests.get(assets_url)
    
    if assets_response.status_code != 200:
        print(f"无法获取文件列表: {assets_response.status_code}")
        return
    
    files = assets_response.json().get('files', [])
    
    # 创建与CDNJS相同的目录结构: output/{library}/{version}/
    cdnjs_path = os.path.join(args.output, args.library, args.version)
    os.makedirs(cdnjs_path, exist_ok=True)
    
    # 下载文件
    if args.file:
        # 下载指定文件
        if args.file in files:
            file_url = urljoin(base_url, args.file)
            local_path = os.path.join(cdnjs_path, args.file)
            download_file(file_url, local_path)
        else:
            print(f"文件 {args.file} 不存在于该版本中")
            print(f"可用文件: {', '.join(files)}")
    else:
        # 下载所有文件
        print(f"下载 {args.library}@{args.version} 的所有文件到 {cdnjs_path}")
        for file in files:
            file_url = urljoin(base_url, file)
            local_path = os.path.join(cdnjs_path, file)
            print(f"下载: {file}")
            download_file(file_url, local_path)

if __name__ == "__main__":
    main()
