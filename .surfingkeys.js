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


// Action

map('`', "'");
// map('F', 'af'); // open in new tab
map('F', 'gf'); // open in new unactive tab
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

mapkey('ym', "#7Copy current page's URL as markdown", function() {
  Front.writeClipboard('[' + document.title + '](' + window.location.href + ')');
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

addSearchAliasX('w', 'wiki', 'http://wiki.yeshj.com/dosearchsite.action?queryString=');
addSearchAliasX('idc', 'idc', 'http://idc.***REMOVED***.net/?page=search&last_page=index&last_tab=default&q=');



// Style

settings.theme = `
`;
