// vim: set ft=javascript tabstop=4 shiftwidth=4 expandtab:
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

map('o', 'go');  // open in current tab

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
    Clipboard.read(function(response) {
        if (response.data.startsWith("http://") || response.data.startsWith("https://")) {
            window.location = response.data;
        } else {
            window.location = response.data = "https://www.google.com/search?q=" + response.data;
        }
    });
});
mapkey('P', 'Open link from clipboard', function() {
    Clipboard.read(function(response) {
        if (response.data.startsWith("http://") || response.data.startsWith("https://")) {
            tabOpenLink(response.data);
        } else {
            tabOpenLink("https://www.google.com/search?q=" + response.data);
        }
    });
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

function get_link_markdown() {
    return '[' + document.title + '](' + window.location.href + ')';
}

function get_link_markdown_with_space() {
    return '[' + document.title + ']( ' + window.location.href + ' )';
}

mapkey('ym', "#7Copy current page's URL as markdown", function() {
    if (window.location.hostname === 'www.atatech.org' || window.location.hostname === 'yuque.alibaba-inc.com' || window.location.hostname === 'yuque.antfin-inc.com') {
        prompt('Copy yourself', get_link_markdown());
        return;
    }
    Clipboard.write(get_link_markdown());
});

mapkey('yM', "#7Copy current page's URL as markdown with space", function() {
    if (window.location.hostname === 'www.atatech.org' || window.location.hostname === 'yuque.alibaba-inc.com' || window.location.hostname === 'yuque.antfin-inc.com') {
        prompt('Copy yourself', get_link_markdown_with_space());
        return;
    }
    Clipboard.write(get_link_markdown_with_space());
});



// Search Engine

addSearchAliasX('zh', 'zhihu', 'https://www.zhihu.com/search?q=');
addSearchAliasX('t', 'twitter', 'https://twitter.com/search/');
addSearchAliasX('we', 'wikipedia-en', 'http://en.wikipedia.org/wiki/Special:Search?search=');
addSearchAliasX('wc', 'wikipedia-cn', 'https://zh.wikipedia.org/w/index.php?title=Special:%E6%90%9C%E7%B4%A2&search=');
addSearchAliasX('tb', 'taobao', 'https://s.taobao.com/search?q=');
addSearchAliasX('h', 'hici', 'http://dict.cn/search.php?q=');
addSearchAliasX('k', 'kindle', 'http://www.amazon.cn/s/ref=nb_sb_noss?field-keywords=');
addSearchAliasX('bing', 'bing', 'http://www.bing.com/search?q=');
addSearchAliasX('etao', 'etao', 'http://s.etao.com/search?q=');
addSearchAliasX('db', 'douban', 'http://www.douban.com/search?q=');
addSearchAliasX('ip', 'ip', 'http://www.ip138.com/ips138.asp?ip=');
addSearchAliasX('wb', 'weibo', 'http://s.weibo.com/weibo/');
addSearchAliasX('jd', 'jd', 'http://search.jd.com/Search?keyword=');
addSearchAliasX('dk', 'duckduckgo', 'https://duckduckgo.com/?q=');
addSearchAliasX('gh', 'github', 'https://github.com/search?ref=opensearch&q=');
addSearchAliasX('y', 'yuque', 'https://yuque.alibaba-inc.com/search?q=');
addSearchAliasX('w', 'work', 'https://work.alipay-corp.com/nwpipe/search?type=all&keywords=');


// settings.blacklistPattern = /https?:\/\/domain.com\/.*\.pptx/i

settings.prevLinkRegex = /(\b(prev|previous)\b)|上页|上一页|前页|<<|«/i;
settings.nextLinkRegex = /(\b(next)\b)|下页|下一页|后页|>>|»/i;

// Style

settings.theme = `
`;
