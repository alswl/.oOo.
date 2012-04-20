" Vim syntax fle
" Language: Less
" Author: Kohpoll (http://www.cnblogs.com/kohpoll/)
" Inspired by the syntax files of scss and css.
" Licensed under MIT.
" Last Modified: 2012-03-12

if exists("b:current_syntax")
	finish
endif

runtime! syntax/css.vim

syn case ignore

syn region lessDefinition matchgroup=cssBraces start="{" end="}" contains=css.*Attr,css.*Prop,cssComment,cssValue.*,cssColor,cssUrl,cssImportant,cssError,cssStringQ,cssStringQQ,cssFunction,cssUnicodeEscape,lessVariable,lessFunction,lessMixinValue,lessNamespaceValue,lessAmpersand,lessDefinition,lessNestedSelector

"syn region lessInterpolation start="@{" end="}" contains=@Spell
syn match lessAmpersand "&" nextgroup=cssPseudoClass

syn match lessVariable "@[[:alnum:]_-]\+" nextgroup=lessVariableAssignment
syn match lessVariableAssignment ":" contained nextgroup=lessVariableValue
syn match lessVariableValue ".*;"me=e-1 contained contains=lessVariable,lessOperator

"syn match lessMixin "^\.\{1}" nextgroup=lessMixinName
"syn match lessMixinName "[[:alnum:]_-]\+" contained nextgroup=lessMixinArgument
"syn match lessMixinArgument "\s*(\=.\{-})\=" contained nextgroup=lessDefinition
syn match lessMixinValue "\s*\.\{1}[[:alnum:]_-]\+" contained

"syn match lessNamespace "#[[:alnum:]_-]\+" nextgroup=lessNamespaceName
"syn match lessNamespaceName "[[:alunum]_-]\+" contained nextgroup=lessNamespaceReference
"syn match lessNamespaceReference "\s*>\s*" contained
syn match lessNamespaceValue "\s*#[[:alnum:]_-]\+\s*>"me=e-1 contained

syn match lessImport "@import " nextgroup=cssStringQQ
syn match lessComment "//.*$" contains=@Spell

syn match lessOperator "+" contained
syn match lessOperator "-" contained
syn match lessOperator "/" contained
syn match lessOperator "*" contained

syn keyword lessFunction round ceil floor percentage
syn keyword lessFunction lighten darken saturate desaturate fadein fadeout fade spin mix hue hsl

syn match lessNestedSelector "[^/]* {"me=e-1 contained contains=cssTagName,cssIdentifier,cssClassName,cssAttributeSelector,cssSelectorOp,cssSelectorOp2,lessAmpersand,lessVariable,lessInterpolation,lessNestedProperty
syn match lessNestedProperty "[[:alnum:]]\+:"me=e-1 contained


hi def link lessVariable Type
hi def link lessVariableValue Constant

hi def link lessFunction PreProc
hi def link lessNamespaceValue PreProc
hi def link lessMixinValue StorageClass

"hi def link lessMixin PreProc
"hi def link lessMixinName PreProc
"hi def link lessMixinArgument Constant 

hi def link lessAmpersand Delimiter
hi def link lessImport Delimiter
"hi def link lessInterpolation Delimiter

hi def link lessComment Comment
"hi def link lessOperator Operator

let b:current_syntax = "less"

" 1.0
" - First version.May be problems here and there.
" - FIX:I can not find ways to exactly define mixin(e.g: .mixinName) and namespace(e.g: #bundle > .util), as they are just the same as class and id of css selector.
