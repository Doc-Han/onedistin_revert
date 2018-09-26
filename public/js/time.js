var months=["","Jan","Feb","Mar","April","May","June","July","Aug","Sep","Oct","Nov","Dec"];function getDate(input){var y="";var m="";var d="";var a;for(i=0;i<input.length;i++){if(i<=3){y+=input[i]}else if(i>3&&i<=5){m+=input[i]}else if(i>5&&i<=7){d+=input[i]}}
if(d[1]=="1"&&d[0]!="1"){a="st"}else if(d[1]=="2"&&d[0]!="1"){a="nd"}else if(d[1]=="3"&&d[0]!="1"){a="rd"}else{a="th"}
m*=1;d*=1;var output=d+a+" "+months[m]+" "+y;return output}
function getDateTime(input){var y="";var m="";var d="";var h="";var min="";var a;for(i=0;i<input.length;i++){if(i<=3){y+=input[i]}else if(i>3&&i<=5){m+=input[i]}else if(i>5&&i<=7){d+=input[i]}else if(i>7&&i<=9){h+=input[i]}else if(i>9&&i<=11){min+=input[i]}}
if(d[1]=="1"&&d[0]!="1"){a="st"}else if(d[1]=="2"&&d[0]!="1"){a="nd"}else if(d[1]=="3"&&d[0]!="1"){a="rd"}else{a="th"}
m*=1;d*=1;var output=h+":"+min+" - "+d+a+" "+months[m]+" "+y;return output}
