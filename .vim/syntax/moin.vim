" Vim syntax file
" Language:     MoinMoin
" Maintainer:   Michael Lamertz <mike@perl-ronin.de>
" Contributors: David O'Callaghan <david.ocallaghan@cs.tcd.ie>
"               Tony Garland <Tony.Garland@fluke.com>
" Last Change:  $Id: moin.vim,v 1.4 2005/04/28 08:14:19 mlamertz Exp $

" Bugs:         Parsing of mixed bold-italic not yet implemented
"               Tables not yet implemented

if version <600
    syntax clear
elsif exists("b:current_syntax")
    finish
endif

syn clear
"hi clear "fixed by @alswl, it will set default colorsechem

" headings
syn match       moinHeader              /^\(=\{1,5}\).*\1$/

" inline markup
syn match       moinItalic              /\('\{2}\)[^']\+\1/
syn match       moinBold                /\('\{3}\)[^']\+\1/
syn match       moinBoldItalic          /\('\{5}\)[^']\+\1/
syn match       moinUnderline           /\(_\{2}\).\{-}\1/
syn match       moinSubscript           /\(,\{2}\).\{-}\1/
syn match       moinSuperscript         /\(\^\).\{-}\1/
syn match       moinTypewriter          /\(`\).\{-}\1/
syn match       moinMacro               /\[\{2}.\{-}\]\{2}/

" Codeblocks
syn region      moinPreformatted        start=/{{{/ end=/}}}/

" Links
syn match       moinWikiWord            /\(\w\+:\)\?\u[a-z0-9]\+\u[a-z0-9]\+\(\u[a-z0-9]\+\)*/
syn match       moinBracketLink         /\[[^[\]]\+\]/
syn match       moinSubLink             /\(\w\+\|\.\.\)\?\// nextgroup=moinWikiWord
syn match       moinNormalURL           /\w\+:\/\/\S\+/
syn match       moinEmail               /\S\+@\S\+/

" lists
syn match       moinBulletList          /^\(\s\+\)\zs\*\ze\s/
syn match       moinNumberedList        /^\(\s\+\)\zs1\.\ze\s/
syn match       moinAlphalist           /^\(\s\+\)\zsa\.\ze\s/
syn match       moinRomanlist           /^\(\s\+\)\zsi\.\ze\s/
syn match       moinBigromanlist        /^\(\s\+\)\zsI\.\ze\s/
syn match       moinDescriptionlist     /^\(\s\+\)\zs.\{-}::\ze\s/

" rules
syn match       moinRule                /^-\{4,}/

" comments/pragmas
syn match       moinComment             /^##.*$/
syn match       moinPragma              /^#\w\+.*$/

" Define the default highlighting.
" For version 5.7 and earlier: only when not done already
" For version 5.8 and later: only when an item doesn't have highlighting yet
if version >= 508 || !exists("did_acedb_syn_inits")
	if version < 508
		let did_acedb_syn_inits = 1
		command -nargs=+ HiLink hi link <args>
	else
		command -nargs=+ HiLink hi def link <args>
	endif

	HiLink      moinHeader              Function

	HiLink      moinItalic              Identifier
	HiLink      moinBold                Identifier
	HiLink      moinBoldItalic          Identifier
	HiLink      moinUnderline           Identifier
	HiLink      moinSubscript           Identifier
	HiLink      moinSuperscript         Identifier
	HiLink      moinTypewriter          Identifier
	HiLink      moinMacro               Define
	HiLink      moinPragma              Define

	HiLink      moinPreformatted        String

	HiLink      moinWikiWord            Statement
	HiLink      moinBracketLink         Statement
	HiLink      moinNormalURL           Statement
	HiLink      moinSubLink             Statement
	HiLink      moinInterLink           Statement
	HiLink      moinEmail               Statement

	HiLink      moinBulletList          Type
	HiLink      moinNumberedList        Type
	HiLink      moinAlphalist           Type
	HiLink      moinRomanlist           Type
	HiLink      moinBigromanlist        Type
	HiLink      moinDescriptionlist     Type

	HiLink      moinRule                Special

	HiLink      moinComment             Comment

  delcommand HiLink
endif

let b:current_syntax = "moin"
