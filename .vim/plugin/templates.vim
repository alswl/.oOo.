" Vim global plugin for providing templates for new files
" Maintainer:  Aristotle Pagaltzis <pagaltzis@gmx.de>
" Last Change: 2004-12-28
" License:     This script is free software; you can redistribute it and/or
"              modify it under the terms of either the Artistic License or
"              the GNU General Public License.

if exists( 'g:loaded_template' ) | finish | endif
let g:loaded_template = 1

augroup template
	autocmd!
	autocmd FileType * if line2byte( line( '$' ) + 1 ) == -1 | call s:loadtemplate( &filetype ) | endif
augroup END

function! s:globpathlist( path, ... )
	let i = 1
	let result = a:path
	while i <= a:0
		let result = substitute( escape( globpath( result, a:{i} ), ' ,\' ), "\n", ',', 'g' )
		if strlen( result ) == 0 | return '' | endif
		let i = i + 1
	endwhile
	return result
endfunction

function! s:loadtemplate( filetype )
	let templatefile = matchstr( s:globpathlist( &runtimepath, 'templates', a:filetype ), '\(\\.\|[^,]\)*', 0 )
	if strlen( templatefile ) == 0 | return | endif
	silent execute 1 'read' templatefile
	1 delete _
	if search( 'cursor:', 'W' )
		let cursorline = strpart( getline( '.' ), col( '.' ) - 1 )
		let y = matchstr( cursorline, '^cursor:\s*\zs\d\+\ze' )
		let x = matchstr( cursorline, '^cursor:\s*\d\+\s\+\zs\d\+\ze' )
		let d = matchstr( cursorline, '^cursor:\s*\d\+\s\+\(\d\+\s\+\)\?\zsdel\>\ze' )
		if ! strlen( x ) | let x = 0 | endif
		if ! strlen( y ) | let y = 0 | endif
		if d == 'del' | delete _ | endif
		call cursor( y, x )
	endif
	set nomodified
endfunction
"
command -nargs=1 New new | set ft=<args>
