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


// Action

map('`', "'");
map('F', 'af');
mapkey('p', "Open the clipboard's URL in the current tab", function() {
    Front.getContentFromClipboard(function(response) {
        window.location.href = response.data;
    });
});
map('P', 'cc');

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


// Search Engine

addSearchAlias('zh', 'zhihu', 'https://www.zhihu.com/search?q=');
addSearchAlias('t', 'twitter', 'https://twitter.com/search/');
addSearchAlias('we', 'wikipedia-en', 'http://en.wikipedia.org/wiki/Special:Search?search=');
addSearchAlias('wc', 'wikipedia-cn', 'https://zh.wikipedia.org/w/index.php?title=Special:%E6%90%9C%E7%B4%A2&search=');
addSearchAlias('tb', 'taobao', 'https://s.taobao.com/search?q=');
addSearchAlias('h', 'hici', 'http://dict.cn/search.php?q=');
addSearchAlias('k', 'kindle', 'http://www.amazon.cn/s/ref=nb_sb_noss?field-keywords=');
addSearchAlias('bing', 'bing', 'http://www.bing.com/search?q=');
addSearchAlias('etao', 'etao', 'http://s.etao.com/search?q=');
addSearchAlias('db', 'douban', 'http://www.douban.com/search?q=');
addSearchAlias('ip', 'ip', 'http://www.ip138.com/ips138.asp?ip=');
addSearchAlias('wb', 'weibo', 'http://s.weibo.com/weibo/');
addSearchAlias('jd', 'jd', 'http://search.jd.com/Search?keyword=');
addSearchAlias('dk', 'duckduckgo', 'https://duckduckgo.com/?q=');

addSearchAlias('w', 'wiki', 'https://wiki.***REMOVED***.net/dosearchsite.action?queryString=');
addSearchAlias('idc', 'idc', 'http://idc.***REMOVED***.net/?page=search&last_page=index&last_tab=default&q=');



// Style

settings.theme = `
`;
