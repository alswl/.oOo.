" vimrc for obsidian
" plugin: https://github.com/esm7/obsidian-vimrc-support
" remember link this file to you vault dir


" # obcommand doc https://meleu.dev/notes/obcommand-list/
"
" nmap j gj
" nmap k gk
" I like using H and L for beginning/end of line
" nmap H ^
" nmap L $
" Quickly remove search highlights
" nmap <F9> :nohl

" Yank to system clipboard
" set clipboard=unnamed

" Go back and forward with Ctrl+O and Ctrl+I
" (make sure to remove default Obsidian shortcuts for these to work)
" exmap back obcommand app:go-back
" nmap <C-o> :back
" exmap forward obcommand app:go-forward
" nmap <C-i> :forward


" Emulate Folding https://vimhelp.org/fold.txt.html#fold-commands
exmap togglefold obcommand editor:toggle-fold
nmap zo :togglefold
nmap zc :togglefold
nmap za :togglefold

exmap unfoldall obcommand editor:unfold-all
nmap zR :unfoldall

exmap foldall obcommand editor:fold-all
nmap zM :foldall

" tab navigate
exmap tabnext obcommand workspace:next-tab
nmap gt :tabnext
exmap tabprevious obcommand workspace:previous-tab
nmap gT :tabprevious

nmap <C-h> gT
nmap <C-l> gt
