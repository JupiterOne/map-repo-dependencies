var tooltips = document.getElementsByClassName("recharts-tooltip-label");
console.log(tooltips);

var erkang = document.createElement("img");
erkang.setAttribute("src", "https://i.ibb.co/KXKZzc2/erkangsface.jpg");
erkang.setAttribute("style", "max-width: 50px");
var quotes = [];

var div = document.createElement("div");
div.setAttribute("style", "max-width: 200px; text-align: center; color: red; ");
var strong = document.createElement("strong");
var text = document.createTextNode("");
strong.appendChild(text);
div.appendChild(erkang);
var br = document.createElement("br");
quotes.push("Jackson has got lunch?");
quotes.push("Is it natural language?");
quotes.push("Where is the blog post?");

div.appendChild(erkang);
div.appendChild(br);
div.appendChild(strong);

setInterval(() => {
  var quote = quotes.shift();
  tooltips[2].appendChild(div);
  text.textContent = quote;
  quotes.push(quote);
}, 3000);
