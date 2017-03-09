// Global

settings.hintAlign = "left";
//Events.hotKey="<Meta-s>";

map('?', 'u');
//map('gi', 'i');
//map('gI', 'I');
unmap('<Ctrl-i>');
map('<Ctrl-i>', '<Alt-s>');  // FIXME it not works https://github.com/brookhong/Surfingkeys/issues/290
//map('<Ctrl-i>', '<Meta-s>');

// Navigator

map('h', 'E');  // tab focus left
map('l', 'R');  // tab focus right
map('u', 'e');  // ⬆️

map('O', 'H');  // open in current tab

map('H', 'S');  // backward
map('L', 'D');  // forward


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

