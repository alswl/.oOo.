" ----------------------------------------------------------------------
"
"    File: auto_mkdir.vim
"  Author: Johannes Holzfuß <DataWraith@web.de>
" Version: 1.0.0
"
" Description:
"     When saving a file, automatically create the file's parent
"     directories if they do not exist yet.
"
"     For example,
"
"         :w foo/bar/baz.txt
"
"     will create the directories foo/ and foo/bar/ if they do not exist
"     already, then save the current buffer as baz.txt
"
" License:
"     This file is placed in the public domain.
"
" ----------------------------------------------------------------------

if exists("g:loaded_auto_mkdir")
	finish
endif
let g:loaded_auto_mkdir = 1

if !exists("*mkdir")
	echomsg "auto_mkdir: mkdir() is not available, plugin disabled."
	finish
endif

if !has("autocmd")
	echomsg "auto_mkdir: autocommands not available, plugin disabled."
	finish
endif

augroup auto_mkdir
	au!
	au BufWritePre,FileWritePre * call <SID>auto_mkdir()
augroup END

function <SID>auto_mkdir()
	" Get directory the file is supposed to be saved in
	let s:dir = expand("<afile>:p:h")

	" Create that directory (and its parents) if it doesn't exist yet
	if !isdirectory(s:dir)
		call mkdir(s:dir, "p")
	endif
endfunction
