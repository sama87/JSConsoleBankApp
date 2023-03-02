const colors = require("colors");
colors.enable();

exports.title = function title(text){
    console.log(text.yellow);
}

exports.text = function title(text){
    console.log(text.cyan);
}

exports.invalid = function invalid(text){
    console.log(text.red);
}

exports.clear = function clear(){
    var text = "";
    for(i = 0; i < 5; i++){
        text += "\n";
    }
    console.log(text);
}