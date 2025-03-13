// vim: set ft=javascript tabstop=4 shiftwidth=4 expandtab:
const {
    aceVimMap,
    mapkey,
    imap,
    iunmap,
    imapkey,
    getClickableElements,
    vmapkey,
    map,
    unmap,
    cmap,
    addSearchAlias,
    removeSearchAlias,
    tabOpenLink,
    readText,
    Clipboard,
    Front,
    Hints,
    Visual,
    RUNTIME,
} = api;

// Constants
var USE_NAVIGATOR_CLIPBOARD_DOMAINS = [
    'yuque.com',
];

// Global

settings.hintAlign = "left";
//Events.hotKey="<Meta-s>";

map('?', 'u');
//map('gi', 'i');
//map('gI', 'I');
unmap('<Ctrl-i>');
map('<Ctrl-i>', '<Alt-s>');  // FIXME it not works https://github.com/brookhong/Surfingkeys/issues/290

// Insert mode

iunmap('<Ctrl-f>');
iunmap('<Ctrl-e>');

// Navigator

map('h', 'E');  // tab focus left
map('l', 'R');  // tab focus right
map('u', 'e');  // ⬆️

// map('o', 'go');  // open in current tab

map('H', 'S');  // backward
map('L', 'D');  // forward
map('T', 'on');

settings.smartPageBoundary = false;
iunmap(":"); // disable emoji input

// Action

map('`', "'");
// map('F', 'af'); // open in new tab
map('F', 'gf'); // open in new unactive tab
mapkey('p', "Open the clipboard's URL in the current tab", function() {
    navigator.clipboard.readText().then(
        text => {
            if (text.startsWith("http://") || text.startsWith("https://")) {
                window.location = text;
            } else {
                window.location = text = "https://www.google.com/search?q=" + text;
            }
        }
    );
});
mapkey('P', 'Open link from clipboard', function() {
    navigator.clipboard.readText().then(
        text => {
            if (text.startsWith("http://") || text.startsWith("https://")) {
                tabOpenLink(text);
            } else {
                tabOpenLink("https://www.google.com/search?q=" + text);
            }
        }
    );
});

// source: https://gist.github.com/Echostream/fe560aa30271172398cf432b7b281fd5
mapkey('gi', '#1Go to edit box', function() {
    var inputs = document.getElementsByTagName('input');
    var input = null;
    for(var i=0; i<inputs.length; i++) {
        if(inputs[i].type=='text') {
            input = inputs[i];
            break;
        }
    }
    if(input) {
        input.click();
        input.focus();
    }
});

function encode_title_in_markdown(input) {
    return input.replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/_/g, '\\_').replace(/\*/g, '\\*');
}

function get_link_markdown() {
    return '[' + encode_title_in_markdown(document.title) + '](' + window.location.href + ')';
}

function get_link_markdown_with_space() {
    return '[' + encode_title_in_markdown(document.title) + ']( ' + window.location.href + ' )';
}

function copyUsingNavigatorClipboard(text) {
    navigator.clipboard.writeText(text);
    Front.showBanner("Copied: " + text);
}

mapkey('ym', "#7Copy current page's URL as markdown", function() {
    var text = get_link_markdown();
    // hack for lark
    if (USE_NAVIGATOR_CLIPBOARD_DOMAINS.includes(window.location.hostname)) {
        copyUsingNavigatorClipboard(text);
        return;
    }
    Clipboard.write(text);
});

mapkey('yM', "#7Copy current page's URL as markdown with space", function() {
    var text = get_link_markdown_with_space();
    // hack for lark
    if (USE_NAVIGATOR_CLIPBOARD_DOMAINS.includes(window.location.hostname)) {
        copyUsingNavigatorClipboard(text);
        return;
    }
    Clipboard.write(text);
});

mapkey('yy', "#7Copy current page's URL", function() {
    var text = document.location.href;
    // hack for lark
    if (USE_NAVIGATOR_CLIPBOARD_DOMAINS.includes(window.location.hostname)) {
        copyUsingNavigatorClipboard(text);
        return;
    }
    Clipboard.write(text);
});

mapkey('yl', "#7Copy current page's title", function() {
    var text = document.title;
    // hack for lark
    if (USE_NAVIGATOR_CLIPBOARD_DOMAINS.includes(window.location.hostname)) {
        copyUsingNavigatorClipboard(text);
        return;
    }
    Clipboard.write(text);
});


// Search Engine

addSearchAlias('zh', 'zhihu', 'https://www.zhihu.com/search?q=');
addSearchAlias('tw', 'twitter', 'https://twitter.com/search/');
addSearchAlias('we', 'wikipedia-en', 'http://en.wikipedia.org/wiki/Special:Search?search=');
addSearchAlias('wc', 'wikipedia-cn', 'https://zh.wikipedia.org/w/index.php?title=Special:%E6%90%9C%E7%B4%A2&search=');
addSearchAlias('tb', 'taobao', 'https://s.taobao.com/search?q=');
addSearchAlias('hi', 'hici', 'http://dict.cn/search.php?q=');
addSearchAlias('bi', 'bing', 'http://www.bing.com/search?q=');
addSearchAlias('db', 'douban', 'http://www.douban.com/search?q=');
addSearchAlias('ip', 'ip', 'https://cip.cc/');
addSearchAlias('wb', 'weibo', 'http://s.weibo.com/weibo/');
addSearchAlias('jd', 'jd', 'http://search.jd.com/Search?keyword=');
addSearchAlias('dk', 'duckduckgo', 'https://duckduckgo.com/?q=');
addSearchAlias('gh', 'github', 'https://github.com/search?ref=opensearch&q=');


// settings.blacklistPattern = /https?:\/\/domain.com\/.*\.pptx/i

settings.prevLinkRegex = /(\b(prev|previous)\b)|上页|上一页|前页|<<|«/i;
settings.nextLinkRegex = /(\b(next)\b)|下页|下一页|后页|>>|»/i;

// Style

settings.theme = `
`;
