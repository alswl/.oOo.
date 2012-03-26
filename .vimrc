"source $VIMRUNTIME/vimrc_example.vim

"""""""""""""""""""""""""""""""""""""""
"平台判断
"""""""""""""""""""""""""""""""""""""""
function! MySys()
	if has("win32")
		return "windows"
	else
		return "linux"
	endif
endfunction

"""""""""""""""""""""""""""""""""""""""
"模仿MS快捷键
"""""""""""""""""""""""""""""""""""""""
"source $VIMRUNTIME/mswin.vim

" CTRL-X and SHIFT-Del are Cut
"vnoremap <C-X> "+x

" CTRL-C and CTRL-Insert are Copy
"vnoremap <C-C> "+y

" CTRL-V and SHIFT-Insert are Paste
"map <C-V>		"+p

"""""""""""""""""""""""""""""""""""""""
"Gerneral
"""""""""""""""""""""""""""""""""""""""
" Enable filetype plugin
filetype plugin on
filetype indent on

" Set to auto read when a file is changed from the outside
set autoread

" 编辑vimrc之后，重新加载
if MySys() == "windows"
	autocmd! bufwritepost _vimrc source ~/_vimrc
else
	autocmd! bufwritepost .vimrc source ~/.vimrc
endif

" 禁用Vi的兼容模式
set nocompatible

" Set windows postion and size
if has("gui_running")
	winpos 0 0
	set lines=41
	set columns=85
endif

" 设定状态栏多显示信息
set laststatus=2

if exists('+autochdir')
	" 文件路径设置为当前路径
	set autochdir
endif

"auto save zz info
au BufWinLeave *.* silent mkview
au BufWinEnter *.* silent loadview

"""""""""""""""""""""""""""""""""""""""
"VIM user interface
"""""""""""""""""""""""""""""""""""""""
" use chinese help
"set helplang=cn

"set the menu & the message to English
set langmenu=en_US
let $LANG="en_US.UTF-8"

set ruler "右下角显示当前光标

"set cmdheight=2 "The commandbar height

" Set backspace config
set backspace=eol,start,indent
"set whichwrap+=<,>,h,l

set ignorecase "Ignore case when searching
set smartcase
"set nowrapscan

" 使用正统的搜索正则
"nnoremap / /\v
"vnoremap / /\v

set hlsearch "Highlight search things

set incsearch "在输入部分查找模式时显示相应的匹配点。
"set nolazyredraw "Don't redraw while executing macros 

set nomagic "Set magic on, for regular expressions

set showmatch "Show matching bracets when text indicator is over them

set sidescroll=10 "左右移动边距

"set list " 显示制表符/回车符
set listchars=tab:>-,trail:$ " 行尾符号

set showcmd "显示右下角命令
set cursorline

set noerrorbells
set novisualbell

"set iskeyword=@,48-57,192-255

if ! has("gui_running")
	set mouse-=a
endif

"设定宽度提醒
if exists('+colorcolumn')
	au FileType python set colorcolumn=79
	au FileType asciidoc set colorcolumn=79
endif

set equalalways "分割窗口时保持相等的宽/高

set guitablabel=%N.%t " 设定标签上显示序号

"""""""""""""""""""""""""""""""""""""""
"Colors and Fonts
"""""""""""""""""""""""""""""""""""""""
syntax enable "Enable syntax hl
"au BufRead,BufNewFile *.aspx set filetype=xml

" Set syntax color
colorscheme desert256

"gfn=consolas:h10
"set gui options
if has("gui_running")
	set guifont=Monospace\ 10
	"set gfw=幼圆:h10:cGB2312
	set guioptions -=m
	set guioptions -=T
	set guioptions -=L
	set guioptions -=r
	"set showtabline=0
endif

set ambiwidth=double " 设定某些标点符号为宽字符

" 设定行首tab为灰色
highlight LeaderTab guifg=#666666

"""""""""""""""""""""""""""""""""""""""
"Files, backups and undo
"""""""""""""""""""""""""""""""""""""""
" Turn backup off, since most stuff is in SVN, git anyway...
set nobackup
set nowb
set noswapfile
set backupext=.bak

"设置编码
set fileencodings=utf-8,gbk,ucs-bom,default,latin1
set termencoding=utf-8
set encoding=utf-8

"Persistent undo
if exists('+undodir')
	if MySys() == "windows"
		set undodir=C:\Windows\Temp
	else
		set undodir=~/.vim_runtime/undodir
	endif
	set undofile
endif

"""""""""""""""""""""""""""""""""""""""
"Text, tab and indent related
"""""""""""""""""""""""""""""""""""""""

"set expandtab
set noexpandtab "是否使用Tab缩进 默认使用

set shiftwidth=4
set tabstop=4
set smarttab

set lbr "智能换行
"set tw=500 "自动换行 超过n列

set ai "Auto indent
set si "Smart indet
set wrap "Wrap lines

"特殊文件类型的缩进控制
au FileType python setlocal expandtab
"au FileType html setlocal shiftwidth=2
"au FileType html setlocal tabstop=2

" textwidth
au FileType python setlocal textwidth=79 fo+=Mm

set showmatch " show matching bracets

"""""""""""""""""""""""""""""""""""""""
"Visual mode related
"""""""""""""""""""""""""""""""""""""""

"""""""""""""""""""""""""""""""""""""""
"Command mode related
"""""""""""""""""""""""""""""""""""""""

"""""""""""""""""""""""""""""""""""""""
"Moving around, tabs and buffers
"""""""""""""""""""""""""""""""""""""""
" Smart way to move btw. windows
map <C-j> <C-W>j
map <C-k> <C-W>k
map <C-h> <C-W>h
map <C-l> <C-W>l

" Use the arrows to something usefull
map <right> :bn<cr>
map <left> :bp<cr>

"""""""""""""""""""""""""""""""""""""""
"Visual Cues
"""""""""""""""""""""""""""""""""""""""
if exists(':relativenumber')
	set number " 显示行号
else
	set relativenumber " 显示相对行号
endif
set numberwidth=2 "行号栏的宽度
" set foldclose=all

"function! MarkPoint()
	"mark `
"endfunction

"autocmd CursorMoved * call MarkPoint()


"""""""""""""""""""""""""""""""""""""""
" Text Formatting/Layout
"""""""""""""""""""""""""""""""""""""""

"""""""""""""""""""""""""""""""""""""""
" Plugin
"""""""""""""""""""""""""""""""""""""""
set tags=tags;

"pydiction 1.2 python auto complete
"let g:pydiction_location = 'D:/Program Files/Vim/vimfiles/ftplugin/pydiction'
"defalut g:pydiction_menu_height == 15
"let g:pydiction_menu_height = 20

"SuperTab
"let g:SuperTabRetainCompletionType = 2
"let g:SuperTabDefaultCompletionType = "<C-X><C-O>" 

"Neo
"let g:neocomplcache_enable_at_startup=1

" Restart
let g:restart_sessionoptions = "restart_session"

" Mark
"nmap <silent> <leader>hl <Plug>MarkSet
"vmap <silent> <leader>hl <Plug>MarkSet
"nmap <silent> <leader>hh <Plug>MarkClear
"vmap <silent> <leader>hh <Plug>MarkClear
"nmap <silent> <leader>hr <Plug>MarkRegex
"vmap <silent> <leader>hr <Plug>MarkRegex

" fuzzyfinder
map <silent> <leader>sf :FufFile<CR>
map <silent> <leader>sb :FufBuffer<CR>

"""""""""""""""""""""""""""""""""""""""
" Map
"""""""""""""""""""""""""""""""""""""""
map <F2>    :Tlist<cr>
"代码折叠快捷方式
map <F3>    zR
map <F4>    zM

" 标签设置
map <F11>    gT
map <F12>    gt
if has("gui_running")
	imap <M-1> <Esc>1gt
	nmap <M-1> 1gt
	imap <M-2> <Esc>2gt
	nmap <M-2> 2gt
	imap <M-3> <Esc>3gt
	nmap <M-3> 3gt
	imap <M-4> <Esc>4gt
	nmap <M-4> 4gt
	imap <M-5> <Esc>5gt
	nmap <M-5> 5gt
	imap <M-6> <Esc>6gt
	nmap <M-6> 6gt
	imap <M-7> <Esc>7gt
	nmap <M-7> 7gt
	imap <M-8> <Esc>8gt
	nmap <M-8> 8gt
	imap <M-9> <Esc>9gt
	nmap <M-9> 9gt
endif

"Map F9 to Run Python Script
au FileType python map <F9> :!python %
" 用空格键来开关折叠
nnoremap <space> @=((foldclosed(line('.')) < 0) ? 'zc' : 'zo')<CR>

" 用Tab匹配括号
nnoremap <tab> %
vnoremap <tab> %

" 用 * / # 匹配选中
vnoremap  *  y/<C-R>=escape(@", '\\/.*$^~[]')<CR><CR>
vnoremap  #  y?<C-R>=escape(@", '\\/.*$^~[]')<CR><CR>

" html缩进
let g:html_indent_inctags = "p,li,dt,dd"

" 模拟 Emacs 键绑定
" first move the window command because we'll be taking it over
inoremap <C-x> <C-w>
" Movement left/right
noremap! <C-b> <Left>
noremap! <C-f> <Right>
" word left/right
inoremap  <M-b> b
noremap! <M-b> <C-o>b
inoremap  <M-f> w
noremap! <M-f> <C-o>w
" line start/end
inoremap  <C-a> ^
noremap! <C-a> <Esc>I
inoremap  <C-e> $
noremap! <C-e> <Esc>A
" Rubout word / line and enter insert mode
inoremap  <C-w> i<C-w>
inoremap  <C-u> i<C-u>
" Forward delete char / word / line and enter insert mode
noremap! <C-d> <C-o>x
inoremap  <M-d> dw
noremap! <M-d> <C-o>dw
inoremap  <C-k> Da
noremap! <C-k> <C-o>D
" Undo / Redo and enter normal mode
inoremap  <C-_> u
noremap! <C-_> <C-o>u<Esc><Right>
noremap! <C-r> <C-o><C-r><Esc>
" Remap <C-space> to word completion
"noremap! <Nul> <C-n>

"""""""""""""""""""""""""""""""""""""""
" 自定义命令
"""""""""""""""""""""""""""""""""""""""
" 删除结尾空格定义
command! -nargs=0 TrimR :%s/\s\+$//g

function! Pdb()
	normal o
	normal <ESC>
	call setline(line("."), "import ipdb;ipdb.set_trace()")
endfunction

" 对比原始文件，显示更改处
if !exists(":DiffOrig")
    command DiffOrig vert new | set bt=nofile | r # | 0d_ | diffthis
          \ | wincmd p | diffthis
endif
