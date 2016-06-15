$(function () {

    //TODO invoke nextprot API and and built a heatmap table for each anatomycal system instead of calling data.json mock file.
    // Related Trello task: https://trello.com/c/DNgw1yLp/12-convert-nextprot-data-into-the-json-format


    var heatmapTableOptions = {
        valuesColorMapping: [
            { value: 'Positive', color: '#FFA10A'},
            { value: 'NotDetected', color: 'lightgray'},
            { value: 'Weak', color: '#FFE6BD'},
            { value: 'Low', color: '#FFE6BD'},
            { value: 'Strong', color: '#FFC870'},
            { value: 'Moderate', color: '#FFC870'},
            { value: 'Medium', color: '#FFC870'}
        ],
        columnWidth: "50px",
        detailTemplate: "detailTemplate"
    }

    var heatmapTableHeader = ['MA-P',
                              'MA-ND',
                              'EST-P', 
                              'IHC-S', 
                              'IHC-M',
                              'IHC-W',
                              'IHC-ND'];
    // var heatmapTableNames = ['alimentary-system', 
    //                          'cardiovascular-system',
    //                          'dermal-system',
    //                          "endocrine-system",
    //                          "exocrine-system",
    //                          "hemolymphoid-and-immune-system",
    //                          "musculoskeletal-system",
    //                          "nervous-system",
    //                          "reproductive-system",
    //                          "respiratory-system",
    //                          "urinary-system",
    //                          "sense-organ",
    //                          "body-part",
    //                          "tissue",
    //                          "cell-type",
    //                          "fluid-and-secretion",
    //                          "gestational-structure"];


    var applicationName = 'protein expression app'; //please provide a name for your application
    var clientInfo = 'JinJin'; //please provide some information about you
    var nx = new Nextprot.Client(applicationName, clientInfo);

    //var proteinAccession = 'NX_P01308'; //Corresponds to Breast cancer protein -> http://www.nextprot.org/db/entry/NX_P38398/expression
    var proteinAccession = nx.getEntryName();

    nx.getAnnotationsByCategory(proteinAccession, 'expression-profile').then(function (data) {

        //Suppose you have a map here for each "roots" another way of doing is calling this method inside the for loop for passing the name of the heatmap table as a parameter
        // var dataMap = convertNextProtDataIntoHeatMapTableFormat(data);

        // for (var i = 0; i < heatmapTableNames.length; i++) {

            // var heatMapTableName = heatmapTableNames[i];
            
        //     var heatMapTable = HeatMapTable({
        //         header: heatmapTableHeader,
        //         tableID: heatMapTableName,
        //         options: heatmapTableOptions
        //     });

        //     var data = dataMap[heatMapTableName];
        //     heatMapTable.loadJSONData(data);
        //     heatMapTable.show();

        //     console.log("Create " + heatMapTableName + " Done.");

        //     $("#"+heatMapTableName).find(".rowLabel").first().click();
        //     $("#"+heatMapTableName).find(".heatmap-rows .tree").first().children().each(function() {
        //         $(this).find(".rowLabel").first().click();
        //     });
        //     $("#"+heatMapTableName).children('p').remove();
        // }

        var heatmapData = convertNextProtDataIntoHeatMapTableFormat(data);
        var heatMapTableName = "heatmap-table";
            
        var heatMapTable = HeatMapTable({
            header: heatmapTableHeader,
            tableID: heatMapTableName,
            options: heatmapTableOptions
        });

        heatMapTable.loadJSONData(heatmapData);
        heatMapTable.show();
        $("#"+heatMapTableName).children('p').remove();


        var rowLabelsToId = {
            "Alimentary system": "alimentary-system",
            "Cardiovascular system": "cardiovascular-system",
            "Dermal system": "dermal-system",
            "Endocrine system": "endocrine-system",
            "Exocrine system": "exocrine-system",
            "Hemolymphoid and immune system": "hemolymphoid-and-immune-system",
            "Musculoskeletal system": "musculoskeletal-system",
            "Nervous system": "nervous-system",
            "Reproductive system": "reproductive-system",
            "Respiratory system": "respiratory-system",
            "Urinary system": "urinary-system",
            "Sense organ": "sense-organ",
            "Body part": "body-part",
            "Tissue": "tissue",
            "Cell type": "cell-type",
            "Fluid and secretion": "fluid-and-secretion",
            "Gestational structure": "gestational-structure"
        }
        $("#"+heatMapTableName).children(".heatmap-body").children("ul").children("li").each(function() {
            var rowLabel = $($(this).children(".heatmap-row").children(".heatmap-rowLabel").children(".rowLabel")[0]).text();
            this.id = rowLabelsToId[rowLabel];
        });
    });


});
