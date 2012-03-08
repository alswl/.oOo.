" vim:foldmethod=marker:fen:
scriptencoding utf-8


if !has('gui_running')
    " NOTE: THIS PLUGIN CAN'T WORK UNDER THE TERMINAL.
    augroup restart
        autocmd!
        autocmd GUIEnter * source <sfile>
    augroup END
    finish
endif

" Load Once {{{
if exists('g:loaded_restart') && g:loaded_restart
    finish
endif
let g:loaded_restart = 1
" }}}
" Saving 'cpoptions' {{{
let s:save_cpo = &cpo
set cpo&vim
" }}}

" Scope Variables {{{
let s:is_win = has('win16') || has('win32') || has('win64')
" }}}
" Global Variables {{{
if !exists('g:restart_command')
    let g:restart_command = 'Restart'
endif
if !exists('g:restart_save_window_values')
    let g:restart_save_window_values = 1
endif
if !exists('g:restart_save_fn')
    let g:restart_save_fn = []
endif
if !exists('g:restart_vim_progname')
    let g:restart_vim_progname = 'gvim'
endif
if !exists('g:restart_sessionoptions')
    let g:restart_sessionoptions = ''
endif
if !exists('g:restart_cd')
    let g:restart_cd = getcwd()
endif

if g:restart_save_window_values
    call add(g:restart_save_fn, 's:save_window_values')
endif
" }}}



function! s:warn(msg) "{{{
    echohl WarningMsg
    echomsg a:msg
    echohl None
endfunction "}}}
function! s:warnf(fmt, ...) "{{{
    call s:warn(call('printf', [a:fmt] + a:000))
endfunction "}}}
function! s:shellescape(...) "{{{
    if s:is_win
        let save_shellslash = &shellslash
        let &l:shellslash = 0
        try
            return call('shellescape', a:000)
        finally
            let &l:shellslash = save_shellslash
        endtry
    else
        return call('shellescape', a:000)
    endif
endfunction "}}}
function! s:spawn(args) "{{{
    let [command; cmdargs] = map(copy(a:args), 's:shellescape(v:val)')
    if s:is_win
        " NOTE: If a:command is .bat file,
        " cmd.exe appears and won't close.
        execute printf('silent !start %s %s', command, join(cmdargs))
    elseif has('gui_macvim')
        macaction newWindow:
    else
        execute printf('silent !%s %s', command, join(cmdargs))
    endif
endfunction "}}}
function! s:is_modified() "{{{
    try
        " TODO Boolean value to select whether user switches to modified buffer or not.
        bmodified
        return 1
    catch
        " Fall through.
    endtry

    for [bufnr, info] in items(s:parse_buffers_info())
        if info.is_modified
            return 1
        endif
    endfor

    return 0
endfunction "}}}
function! s:parse_buffers_info() "{{{
    " This function is from dumbbuf.vim :)


    " redirect output of :ls! to ls_out.
    redir => ls_out
    silent ls!
    redir END
    let buf_list = split(ls_out, "\n")

    " see ':help :ls' about regexp.
    let regex =
        \'^'.'\s*'.
        \'\(\d\+\)'.
        \'\([u ]\)'.
        \'\([%# ]\)'.
        \'\([ah ]\)'.
        \'\([-= ]\)'.
        \'\([\+x ]\)'

    let result = {}

    for line in buf_list
        let m = matchlist(line, regex)
        if empty(m) | continue | endif

        " bufnr:
        "   buffer number.
        "   this must NOT be -1.
        " unlisted:
        "   'u' or empty string.
        "   'u' means buffer is NOT listed.
        "   empty string means buffer is listed.
        " percent_numsign:
        "   '%' or '#' or empty string.
        "   '%' means current buffer.
        "   '#' means sub buffer.
        " a_h:
        "   'a' or 'h' or empty string.
        "   'a' means buffer is loaded and active(displayed).
        "   'h' means buffer is loaded but not active(hidden).
        " minus_equal:
        "   '-' or '=' or empty string.
        "   '-' means buffer is not modifiable.
        "   '=' means buffer is readonly.
        " plus_x:
        "   '+' or 'x' or empty string.
        "   '+' means buffer is modified.
        "   'x' means error occured while loading buffer.
        let [bufnr, unlisted, percent_numsign, a_h, minus_equal, plus_x; rest] = m[1:]

        let result[bufnr] = {
            \'nr': bufnr + 0,
            \'is_unlisted': unlisted ==# 'u',
            \'is_current': percent_numsign ==# '%',
            \'is_sub': percent_numsign ==# '#',
            \'is_active': a_h ==# 'a',
            \'is_hidden': a_h ==# 'h',
            \'is_modifiable': minus_equal !=# '-',
            \'is_readonly': minus_equal ==# '=',
            \'is_modified': plus_x ==# '+',
            \'is_err': plus_x ==# 'x',
            \'lnum': -1,
        \}
    endfor

    return result
endfunction "}}}

function! s:restart(bang) abort "{{{
    if s:is_modified() && !a:bang
        call s:warn("modified buffer(s) exist!")
        return
    endif

    let spawn_args = [g:restart_vim_progname]
    for Fn in g:restart_save_fn
        let r = call(Fn, [])
        for ex in type(r) == type([]) ? r : [r]
            let spawn_args += ['-c', ex]
        endfor
        unlet Fn
    endfor

    if g:restart_sessionoptions != ''
        " The reason why not use tempname() is that
        " the created file will be removed by Vim at exit.
        let session_file = fnamemodify('restart_session.vim', ':p')
        let i = 0
        while filereadable(session_file)
            let session_file = fnamemodify('restart_session_' . i . '.vim', ':p')
            let i += 1
        endwhile
        let ssop = &sessionoptions
        let &sessionoptions = g:restart_sessionoptions
        mksession `=session_file`
        let spawn_args += ['-S', session_file,
        \                  '-c', 'call delete(' . string(session_file) . ')']
        let &sessionoptions = ssop
    endif

    wviminfo

    " Delete all buffers to delete the swap files.
    silent! 1,$bwipeout

    cd `=g:restart_cd`
    call s:spawn(spawn_args)

    execute 'qall' . (a:bang ? '!' : '')
endfunction "}}}

function! s:save_window_values() "{{{
    return [
    \   printf('set lines=%d', &lines),
    \   printf('set columns=%d', &columns),
    \   printf('winpos %s %s', getwinposx(), getwinposy()),
    \]
endfunction "}}}



" Command to restart {{{
if g:restart_command != ''
    execute 'command! -bar -bang' g:restart_command 'call s:restart(<bang>0)'
endif
" }}}

" Restore 'cpoptions' {{{
let &cpo = s:save_cpo
" }}}
