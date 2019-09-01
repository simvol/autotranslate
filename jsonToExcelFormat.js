// Script takes json and makes xls like json (which than can be transformed into xls format)

$("#transformToXls").click(function(){
    var baseJson = $("#baseJsonInput")[0].files[0];
    var files = [];
    $("#xlsContainer").html("Loading...");

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
    var timer = setInterval(doStaffIfReady, 1000);
    function doStaffIfReady(){
        if(files.length === 1){
            clearInterval(timer);
            transformToXlsJson(JSON.parse(files[0]));
        }
    };
});

function transformToXlsJson(baseJson){

    var arr = [];
    //go throw json and make objects with EN: value, can have extra level to name worksheet
    /*
        {
            "Landing Page": [ //worksheet tab
                {
                    "EN": "Hello this is landing page"
                }
            ]
        }
    */

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
            //create array of values with paths
            arr.push({
                parent: parent,
                value: obj
            });
        };
    };
    scan(baseJson, "");

    //Tabs we want to have in your excel file
    var tabs = ["general", "landing", "order", "confirm", "upsell", "contactUs"];
    var excelLike = { general: [] }; //by default just has general tab

    //For each element in the array, containing json values and their paths, push it to array with name the element has in ints path
    // for example array[landing][settings][text] will be placed in 'landing' array
    arr.forEach(function(text){

        //if path contains element from tabs array, and 
        //.. if excelLike has this element, push value inside it 
        //.. if excelLike doesnt have this element we add it, then we push value inside it
        var tab = isInside(text);
        if (tab && tab.length > 0){
            if(excelLike[tab]){
                excelLike[tab].push({"EN": text.value}); //found existing tab pushed inside
            } else {
                excelLike[tab] = [];
                excelLike[tab].push({"EN": text.value}); //found non-existing tab, made it and pushed inside
            }
        } else {
            excelLike.general.push({"EN": text.value}); //haven't found any tabs, pushed in general
        }

    });

    function isInside(text){
        var found = "";

        // trying to find one of the tabs in object parents
        tabs.forEach(function(tab){
            var formattedTab = "['" + tab + "']"; //obj.parent looks like "['landing']['settings']['text1']"
            var index = text.parent.indexOf(formattedTab); 

            if (index >= 0){
                found = tab;
            }
        });

        return found;
    }

    var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(excelLike));
    $("#xlsContainer").html("");
    $('<a href="data:' + data + '" download="data.json">download xls JSON</a>').appendTo('#xlsContainer');

};













