//TODO from excel to json
//TODO from json to excel
/*
    We made a new website with english base.json. Now, we need to translate this to different languages.
    We grab base.json and convert it to excel file, hand this excel file to a translator. Give strict
    instructions - not to type some stuff that will break everything (new lines etc). 
    Once we have excel with the translations we can use this script to replace values with the translations.
*/

$("#start").click(function(){
    var baseJson = $("#baseJsonInput")[0].files[0];
    var translations = $("#excelJsonInput")[0].files[0];  
    var language = $("#language")[0].value;
    var files = [];
    var isLoading = false;

    $("#container").html("Loading...");

    function getContent(file) {
      var name = file.name;
      var reader = new FileReader();  
      reader.onload = function(e) {  
        // get file content
        var result = e.target.result;
        files.push(result);
      }
      reader.readAsText(file, "UTF-8");
    }
    
    getContent(baseJson);
    getContent(translations);

    var timer = setInterval(doStaffIfReady, 1000);
    function doStaffIfReady(){
        if(files.length === 2 && language){
                        
            clearInterval(timer);
            init(files[0], files[1], language);
        }
    };
});

function init (bj, tr, lang) {

        var baseJson = JSON.parse(bj);
        var translations = JSON.parse(tr);
        var language = lang.toUpperCase();

        var arr = [];
        //baseJson
        //translations

        //go through each element of the baseJson
        function scan(obj, parent) {
            var k;
            if (obj instanceof Object) {
                for (k in obj) {
                    if (obj.hasOwnProperty(k)) {
                        //recursive call to scan property
                        scan(obj[k], parent + "['" + k + "']");
                    }
                }
            } else {

            };
            arr.push({
                parent: parent,
                obj: obj
            });
        };
        scan(baseJson, "");


        var counter = 0;

        arr.forEach(function(e) {

            //// testing
            // if(e.obj === "CLAIM BONUS BOTTLES"){
            //  eval("baseJson" + e.parent + " = 'dont claim anything'");   
            // }
            for (tab in translations) {

                translations[tab].forEach(function(line) { //for each line in excel
                    var jsonLine = "" + e.obj; //make sure its a string
                    var englishLine = line["EN"];
                    var newLanguageLine = line[language];
                    var spaceAtTheBeginning = "";
                    var spaceAtTheEnd = "";

                    //figure out if we need space at the end
                    if(jsonLine[jsonLine.length-1] === " "){
                        spaceAtTheEnd = " ";
                        jsonLine = jsonLine.substring(0, jsonLine.length-1); //remove trailing space
                    }

                    //figure out if we need space at the beginning
                    if(jsonLine[0] === " "){
                        spaceAtTheBeginning = " ";
                        jsonLine = jsonLine.substring(1, jsonLine.length); //remove space in front
                    }

                    //format new language line
                    if(newLanguageLine){

                    	//replace all new lines characters with spaces
                    	var escapedChars = "\r\n";
                    	var regExEscapedChars = new RegExp(escapedChars, "g");
                    	newLanguageLine = newLanguageLine.replace(regExEscapedChars, " ");

                    	//add spaces at the beginning or at the end if needed
	                    newLanguageLine = spaceAtTheBeginning + newLanguageLine + spaceAtTheEnd;
                    }

                    // if english text from excel equals to baseJson text
                    if (englishLine && jsonLine && englishLine.length > 0 && englishLine.toLowerCase() == jsonLine.toLowerCase()) {                                  //if there is english translation
                        if (newLanguageLine) {                                      //if there is our language
                            eval("baseJson" + e.parent + " = '" + newLanguageLine + "'"); //change baseJson
                            counter++;
                        }
                    }
                })
            };


        });
        // console.log("Replacements: ", counter);
        // console.log(baseJson);
        // console.log(arr);

        var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(baseJson));
        $("#container").html("");
        $("#info").html("");
        $('<span>Translations made: ' + counter + '</span>').appendTo('#info');
        $('<a href="data:' + data + '" download="data.json">download JSON</a>').appendTo('#container');


    };