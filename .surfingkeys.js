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


settings.theme = `
`;

