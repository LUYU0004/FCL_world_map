/**
 * Created by yuhao on 2/6/16.
 */

function convertArrayOfObjectsToCSV(args) {
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    console.log("columnDelimiter ="+columnDelimiter);
    console.log("lineDelimeter = "+lineDelimiter);

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
}

function downloadCSV(args) {
    var data, filename, link;

    var csv = convertArrayOfObjectsToCSV({
        data: SC.clustersCollection
    });
    if (csv == null) return;

    filename = args.filename || 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);

    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
}

/*
* 
*     //somehow does not work
 d3.csv("data/complementary/project_Cluster_Info (1).csv",
 function(error, rows) {
 var data = [];
 rows.forEach(function(r) {
 data.push({
 ClusterNo: +r.ClusterNo,
 ProjectNo:r.ProjectNo
 })
 });

 sort_CSV(data,'descending');

 });*/

//d3Comparator = 'ascending'  or 'descending'
function sort_CSV(data, d3Comparator) {
    if (data == undefined) return null;

    data  = data.sort(function (a, b) {
        var res = d3[d3Comparator](a.ProjectNo, b.ProjectNo);
        console.log(res);
        return res;
    });

    console.log("data = "+data[0].ProjectNo);
}
/*
function sort_CSV(data, comparator, order) {
    if (data == undefined) return null;

        data = data.sort(function (a, b) {
        return d3[Comparator](a.expense, b.expense);
    });
}*/


/*
 //create the csv info
 for(i=1; i< clusters.length;i++){

 cluster_length = clusters[i].length;
 for(var j=0;j<cluster_length;j++) {
 the_country = project_countries[clusters[i][j]];

 //to create object for csv generation
 clusterObj["CountriesIncluded"] = cluster_countries[i];
 clusterObj["TierNo"] = 1;
 clusterObj["ClusterNo"] = i;
 clusterObj["ProjectNo"] = number;
 clusterObj["Longtitude"] = average_longtitude[i];
 clusterObj["Latitude"] = average_latitude[i];
 clusterObj["Projects_Included"] = clusters[i];
 clusterObj["Title"] = title;
 clusterObj["Text"] = text;
 SC.clustersCollection.push(clusterObj);
 clusterObj = {};
 }
 }*/



/*sort the cluster in terms of size, in order to draw larger ones first and put smaller ones ontop */
/*for(i=1;i< clusterCount+1;i++) {

 number = clusterNumber[i];
 average_longtitude[i] = average_longtitude[i] / number;
 average_latitude[i] = average_latitude[i] / number;
 title = "<b>Cluster " + i + "</b>";
 text = title + "<br><br>Radius = " + (5 * number) +
 "<br>Project Number:  " + clusterNumber[i];
 addpoint(color, average_longtitude[i], average_latitude[i], title, text, number);

 //to create object for csv generation
 clusterObj["CountriesIncluded"] = cluster_countries[i];
 clusterObj["TierNo"] = 1;
 clusterObj["ClusterNo"] = i;
 clusterObj["ProjectNo"] = number;
 clusterObj["Longtitude"] = average_longtitude[i];
 clusterObj["Latitude"] = average_latitude[i];
 clusterObj["Projects_Included"] = clusters[i];
 clusterObj["Title"] = title;
 clusterObj["Text"] = text;
 SC.clustersCollection.push(clusterObj);
 clusterObj = {};
 }*/

/*
 for(i=1;i< clusterCount+1;i++) {

 number = clusterNumber[i];
 average_longtitude[i] = average_longtitude[i] / number;
 average_latitude[i] = average_latitude[i] / number;
 title = "<b>Cluster " + i + "</b>";
 text = title + "<br><br>Radius = " + (5 * number) +
 "<br>Project Number:  " + clusterNumber[i];
 addpoint(color, average_longtitude[i], average_latitude[i], title, text, number);

 //to create object for csv generation
 clusterObj["CountriesIncluded"] = cluster_countries[i];
 clusterObj["TierNo"] = 1;
 clusterObj["ClusterNo"] = i;
 clusterObj["ProjectNo"] = number;
 clusterObj["Longtitude"] = average_longtitude[i];
 clusterObj["Latitude"] = average_latitude[i];
 clusterObj["Projects_Included"] = clusters[i];
 clusterObj["Title"] = title;
 clusterObj["Text"] = text;
 SC.clustersCollection.push(clusterObj);
 clusterObj = {};
 }
 });*/

/*

 }

 console.log("ClustersCollection = "+clustersCollection);
 /*
 //Use D3 to select the SVG DOM elements.
 */
/*   var circles = d3.selectAll('.point');
 // Create some array of z-indices with a 1:1 relationship with your SVG elements (that you want to reorder). Z-index arrays used in the examples below are IDs, x & y position, radii, etc....
 var zOrders = {
 // IDs: circles[0].map(function(cv){ return cv.id; }),
 xPos: circles[0].map(function(cv){ return cv.cx.baseVal.value; }),
 yPos: circles[0].map(function(cv){ return cv.cy.baseVal.value; }),
 radii: circles[0].map(function(cv){ return cv.r.baseVal.value; })
 //customOrder: [3, 4, 1, 2, 5]


 }
 //Then, use D3 to bind your z-indices to that selection.
 circles.data(zOrders[radii]);
 //Lastly, call D3.sort to reorder the elements in the DOM based on the data.
 circles.sort(function(a,b){
 var res = b-a;
 if(res>0) return -1;
 if(res==0) return 0;
 if(res<0) return 1;
 });//zOrders[radii]*/


//g.append("use").attr("xlink","href="+top_node);//<use xlink:href="#one"/>