/**
 * Created by yuhao on 15/6/16.
 */



function draw_tiers(){

    d3.csv("data/fcl/1. Projects.csv", function (err, projects) {

        if(err)
            console.log(err);

        var dist_matrix = generate_DistMatrix(projects);
        var tier1_range = 100;
        //var tier2_range = 50;
        //var tier3_range = 10;  //this tier is for zoomable circles
        var tier1 = find_tier(dist_matrix, tier1_range); //output: tier_status, clusterNumber,clusters
        console.log(tier1);
        //var tier2 = find_tier(dist_matrix,tier2_range);
        //var tier3 = find_tier(dist_matrix, tier3_range);
        var tier_status = tier1[0];  //index 0-54 indicates 55 projects
        var clusterNumber = tier1[1];  //index zero with nothing
        var clusters = tier1[2];    //index zero shows the number of projects not belonging to any cluster
        var average_longitude = [0];  // index 1 to number of clusters
        var average_latitude  =[0];
        var clusterCount = clusterNumber.length-1;
        var clusterIndex;

        //initialize the arrays
        for(var i=0;i< clusterCount;i++){
            average_latitude.push(0);
            average_longitude.push(0);
        }

        var lat, long;
        var project_index;// start from 1 to 55
        var project_countries = [''];// start from index 1 , indicates project 1

        var lat_list=[0];//start from index 1
        var long_list = [0];
        projects.forEach(function (i) {
            project_index = i.No;
            lat = Number(i.Latitude);
            long = Number(i.Longitude);
            var title = "<b>"+i.FCL_Project+"  "+i.Case_study+"</b>";
            var text = "<br><p>"+i.Title+"</p>"+"<p style='font-size: 12px;'>Coordinate: "+ lat +"° N, "+ long+"°E <br>"
                +i.Description+"</p>";
            clusterIndex = tier_status[project_index-1];
            average_latitude[clusterIndex] =average_latitude[clusterIndex] + lat;
            average_longitude[clusterIndex] = average_longitude[clusterIndex] + long;
            lat_list.push(lat);
            long_list.push(long);
            //addpoint((tier_status[project_index-1]-1),i.Longitude,i.Latitude,title, title+text,undefined,project_index);
            project_countries.push('');
            project_countries[project_index] = i.Country;
        });



        //draw circles
        var title;
        var text;
        var number;
        var color=9;

        var clusterObj = {};
        var cluster_countries = [[]];// start from index 1
        var found ;
        var the_country;
        var cluster_length;
        var country_tiers = [];
        var countryObj = {};
        var country_index ;
        var country_no;

        //list the 2D arrays -- countries in each tier 1 cluster
        for(i=1; i< clusters.length;i++){
            cluster_countries.push([]);
            cluster_length = clusters[i].length;
            country_no =0;
            for(var j=0;j<cluster_length;j++){
                country_index = clusters[i][j];
                the_country = project_countries[country_index];

                //check if the country name exist alr in cluster_countries[i]
                found = cluster_countries[i].filter(function(d){
                    return d ==the_country;
                });

                if(found == undefined || found.length ==0) {
                    country_no++;
                    cluster_countries[i].push(the_country);
                    countryObj[the_country] = {};
                    countryObj[the_country]['Name'] = the_country;
                    countryObj[the_country]['ProjectsIncluded']=country_index;
                    countryObj[the_country]['ProjectNumber'] = 1;
                    countryObj[the_country]['total_Lat'] = lat_list[country_index];
                    countryObj[the_country]['total_Long'] = long_list[country_index];
                    //TierNo,Name,ClusterNo,ProjectNo,Longitude,Latitude,Projects_Included,Title,Text,CountriesIncluded
                }
                else{
                    countryObj[the_country]['ProjectsIncluded']+=' '+country_index;
                    countryObj[the_country]['ProjectNumber']++;
                    countryObj[the_country]['total_Lat'] +=lat_list[country_index];
                    countryObj[the_country]['total_Long'] +=long_list[country_index];

                }

                found = undefined;
            }
            countryObj['country_no'] = country_no;
            country_tiers.push(countryObj);
            countryObj = {};
        }

        /*using (1) project_Cluster_info(1).csv ---providing tier1 clusters, can be deemed as continent lvl
         ,organized tgr if distance less than tier1_range = 100
         *       (2) country_tiers array --providing country-lvl cluster
         * purpose: to generate a 3-tier classfication json file to store parent-children relationship for zoomable circles*/

        // to store the whole array, each object of it is a cluster {"name":"", "children":[]} or real project{"name":"", "size":1 }*/

        SC.clustersCollection = {"name":"root",
            "latitude": 0,
            "longitude": 0,
            "children":[]};

        var size_unit  = 700;
        var tier1_cluster = {};  //root of each zoomable circle

        var tier2_cluster ={};

        var tier3_cluster = {};

        var project_object = {}; //real-project,
        //TierNo,ProjectIndex,FCL_Project,Case Study,Longitude,Latitude,Title,Text,Country,City

        d3.csv("data/complementary/project_Cluster_Info (1).csv", function (err, tier1s) {

            var index = 0;

            //add in the points not in any clusters, clusters[0]
            for (j = 0; j < clusters[0].length; j++) {
                index++;

                project_object["tierNo"] = 4;
                project_object["index"] = index;
                project_object["projectIndex"] = clusters[0][j]; // add in projects accordingly, 1-55
                project_object["size"] = size_unit;
                project_object["parentIndex"] =  null;

                var projectInfo = projects.filter(function (d) {
                    return Number(d.No) == Number(clusters[0][j]);
                });

                if (projectInfo.length > 0) {
                    //FCL_Project,Case_study,Latitude,Longitude,Title,Description,Image_Credit,City,Country
                    project_object["fcl_project"] = projectInfo[0].FCL_Project;
                    project_object["case_study"] = projectInfo[0].Case_study;
                    project_object["latitude"] = projectInfo[0].Latitude;
                    project_object["longitude"] = projectInfo[0].Longitude;
                    project_object["name"] = "<b>"+projectInfo[0].FCL_Project+"<br>"+ projectInfo[0].Case_study+"</b>";
                    project_object["text"] = "<br><p>"+projectInfo[0].Title+"</p>"+"<p style='font-size: 12px;'>Coordinate: "+ projectInfo[0].Latitude +"° N, "+ projectInfo[0].Longitude+"°E <br>"
                        +projectInfo[0].City+" , "+projectInfo[0].Country+"<br>"+projectInfo[0].Description+"</p>";
                    project_object["country"] = projectInfo[0].Country;
                    project_object["city"] = projectInfo[0].City;

                }

                SC.clustersCollection["children"].push(project_object);
                projectInfo = [];
                project_object = {};
            }

            //add in projects in any clusters

            var tier1_cluster_length ;
            var tier1_children;
            var tier1_children_proNo;
            var tier1_children_name;

            tier1s.forEach(function (t1_cluster) {


                var t1_clusterNo = t1_cluster.ClusterNo;
                var t1_clusterName = t1_cluster.Name;
                var projectsIncluded;

                if(t1_clusterName == undefined)
                    return;

                tier1_cluster_length = country_tiers[t1_clusterNo-1]["country_no"];

                var tier1_index;
                var aver_lat_tier3 = [] ;
                var aver_long_tier3 =[];
                var key, y_coordinate, tier3_index;

                var tier2_name = Object.keys(country_tiers[t1_clusterNo - 1])[0];
                var tier2 = country_tiers[t1_clusterNo - 1][tier2_name];

                if(tier2["ProjectsIncluded"].length>1)
                    projectsIncluded = tier2["ProjectsIncluded"].split(" ");

                if (tier1_cluster_length==1) {  // if only 1 country included, add in tier2 cluster as children to root

                    var tier2_proNo= tier2 ["ProjectNumber"];
                    index++;

                    tier2_cluster["tierNo"] = 2;
                    tier2_cluster["name"] = tier2_name;
                    tier2_cluster["index"] = index;
                    tier2_cluster["projectCount"] = tier2_proNo;
                    tier2_cluster["longitude"] = tier2 ["total_Long"] / tier2_proNo;
                    tier2_cluster["latitude"] = tier2 ["total_Lat"] / tier2_proNo;
                    tier2_cluster["projects_Included"] = projectsIncluded;
                    tier2_cluster["title"] = tier2_name;
                    tier2_cluster["text"] =  "<br>ProjectNo = " + tier2_proNo;
                    tier2_cluster["children"] = [];


                    //tier3 - those projects having the same coordinates, thus projected overlapped on map
                    var tier2_index = index;
                    var tier3_candidates = {};
                    var x_list = {};
                    var y_list = {};
                    var y_list_reverse = {};
                    var formed = [];

                    //prepare info needed for tier 3 clustering
                    for (j = 0; j < tier2_proNo; j++) {

                        var projectNumber = projectsIncluded[j];
                        formed[projectNumber] = false;

                        projectInfo = projects.filter(function (d) {
                            return Number(d.No) == Number(projectNumber);
                        });


                        if (projectInfo.length > 0) {
                            tier3_candidates[projectNumber] = {};
                            tier3_candidates[projectNumber]["projectInfo"] = projectInfo;

                            var long = parseInt(projectInfo[0].Longitude);
                            if (x_list[long] == undefined) {
                                x_list[long] = [];
                                x_list[long].push(projectNumber);
                            }
                            else {
                                x_list[long].push(projectNumber);
                            }
                            var lat = parseInt(projectInfo[0].Latitude);
                            y_list[projectNumber] = lat;
                        }
                        projectInfo = [];

                    }

                    for (i = 0; i < Object.keys(x_list).length; i++) {
                        key = Object.keys(x_list)[i];
                        if (x_list[key].length > 1) {

                            for (j = 0; j < x_list[key].length; j++) {
                                projectNumber = x_list[key][j];
                                y_coordinate = y_list[projectNumber];
                                if (y_list_reverse[y_coordinate] == undefined) {
                                    y_list_reverse[y_coordinate] = [];
                                    y_list_reverse[y_coordinate].push(projectNumber);
                                } else {
                                    y_list_reverse[y_coordinate].push(projectNumber);
                                }
                            }

                        }
                    }

                    //y_list_reverse stores projects with same coordinates

                    for (i = 0; i < Object.keys(y_list_reverse).length; i++) {

                        aver_lat_tier3.push(0);
                        aver_long_tier3.push(0);

                        var projectNo = y_list_reverse[Object.keys(y_list_reverse)[i]].length;
                        var projectsIn = y_list_reverse[Object.keys(y_list_reverse)[i]];
                        if (projectNo > 1) { // to form tier 3 clusters
                            index++;


                            tier3_cluster["index"] = index;
                            tier3_cluster["tierNo"] = 3;
                            tier3_cluster["children"] = [];
                            tier3_cluster["projects_Included"] = projectsIn;
                            tier3_cluster["title"] = "";

                            tier3_index = index;
                            //add projects to each tier3 cluster
                            for (j = 0; j < projectNo; j++) {
                                var projectIndex =projectsIn[j];
                                formed[projectIndex] = true;
                                index++;

                                var project = tier3_candidates[projectNumber]["projectInfo"][0];
                                project_object["projectIndex"] = project.No;
                                project_object["index"] = index;
                                project_object["tierNo"] = 4;
                                project_object["fcl_project"] = project.FCL_Project;
                                project_object["case_study"] = project.Case_study;
                                project_object["latitude"] = project.Latitude;
                                project_object["longitude"] = project.Longitude;
                                project_object["name"] = "<b>"+project.FCL_Project+"<br>"+ project.Case_study+"</b>";
                                project_object["text"] = "<br><p>" + project.Title + "</p>" + "<p style='font-size: 12px;'>Coordinate: " + project.Latitude + "° N, " + project.Longitude + "°E <br>"
                                    +project.City+" , "+project.Country+"<br>"+ project.Description + "</p>";
                                project_object["country"] = project.Country;
                                project_object["city"] = project.City;
                                project_object["parentIndex"] = tier3_index;
                                project_object["size"] = size_unit;

                                aver_lat_tier3[i] += Number(project.Latitude);
                                aver_long_tier3[i] += Number(project.Longitude);
                                tier3_cluster["children"].push(project_object);
                                project_object = {};
                            }

                            tier3_cluster["longitude"] = aver_long_tier3[i] / projectNo;
                            tier3_cluster["latitude"] = aver_lat_tier3[i] / projectNo;

                            tier2_cluster["children"].push(tier3_cluster);
                            tier3_cluster = {};

                        }

                    }// end of tier 3 formation

                    //to build projects for other non-tier3 projects
                    for (j = 0; j < tier2_proNo; j++) {
                        projectIndex = projectsIncluded[j];
                        if (formed[projectIndex] == false) {
                            formed[projectIndex] = true;
                            index++;

                            project = tier3_candidates[projectIndex]["projectInfo"][0];
                            project_object["index"] = index;
                            project_object["tierNo"] = 4;
                            project_object["fcl_project"] = project.FCL_Project;
                            project_object["case_study"] = project.Case_study;
                            project_object["latitude"] = project.Latitude;
                            project_object["longitude"] = project.Longitude;
                            project_object["name"] = "<b>"+project.FCL_Project+"<br>"+ project.Case_study+"</b>";
                            project_object["text"] = "<br><p>" + project.Title + "</p>" + "<p style='font-size: 12px;'>Coordinate: " + project.Latitude + "° N, " + project.Longitude + "°E <br>"
                                +project.City+" , "+project.Country+"<br>"+ project.Description + "</p>";
                            project_object["country"] = project.Country;
                            project_object["city"] = project.City;
                            project_object["parentIndex"] = tier2_index;
                            project_object["size"] = size_unit;

                            tier2_cluster["children"].push(project_object);
                            project_object = {};
                        }

                    }// end of forming non-tier3 projects

                    SC.clustersCollection["children"].push(tier2_cluster);
                    tier2_cluster = {};

                }else {  // tier 1 more than 1 country

                    index++;
                    tier1_cluster["index"] = index;
                    tier1_cluster["tierNo"] = 1;
                    tier1_cluster["name"] = t1_clusterName;
                    //tier1_cluster["clusterNo"] = t1_cluster.ClusterNo;
                    tier1_cluster["projectCount"] = t1_cluster.ProjectNo;
                    tier1_cluster["longitude"] = t1_cluster.Longitude;
                    tier1_cluster["latitude"] = t1_cluster.Latitude;
                    tier1_cluster["projects_Included"] = t1_cluster.Projects_Included;
                    //tier1_cluster["title"] = t1_cluster.Title;
                    tier1_cluster["text"] = t1_cluster.Text;
                    tier1_cluster["children"] = [];
                    //tier2_proNo = tier2["ProjectNumber"];
                    tier1_index = index;

                    clusterIndex = 0;
                    while(clusterIndex < tier1_cluster_length){

                        tier1_children_name = Object.keys(country_tiers[t1_clusterNo - 1])[clusterIndex];
                        clusterIndex++;

                        tier1_children = country_tiers[t1_clusterNo - 1][tier1_children_name];

                        tier1_children_proNo = tier1_children["ProjectNumber"];

                        if(tier1_children_proNo>1){  //when a country only has at least two projects
                            projectsIncluded= tier1_children["ProjectsIncluded"].split(" ");

                            index++;
                            tier2_cluster["index"] = index;
                            tier2_cluster["tierNo"] = 2;
                            tier2_cluster["name"] = tier1_children_name;
                            //tier2_cluster["clusterNo"] = clusterIndex;
                            tier2_cluster["projectCount"] = tier1_children_proNo;
                            tier2_cluster["longitude"] = tier1_children["total_Long"] / tier1_children_proNo;
                            tier2_cluster["latitude"] = tier1_children["total_Lat"] / tier1_children_proNo;
                            tier2_cluster["projects_Included"] = projectsIncluded;
                            tier2_cluster["text"] = "<br>ProjectNo = " + tier1_children_proNo;
                            tier2_cluster["children"] = [];
                            tier2_cluster["parentIndex"] = tier1_index;
                            tier2_index = index;


                            // add tier3 or concrete projects as children to tier2 clusters

                            //tier3 - those projects having the same coordinates, thus projected overlapped on map

                            tier3_candidates = {};
                            x_list = {};
                            y_list = {};
                            y_list_reverse = {};
                            formed = [];

                            //prepare info needed for tier 3 clustering
                            for (j = 0; j < tier1_children_proNo; j++) {

                                projectNumber = projectsIncluded[j];
                                formed[projectNumber] = false;

                                projectInfo = projects.filter(function (d) {
                                    return Number(d.No) == Number(projectNumber);
                                });

                                if (projectInfo.length > 0) {
                                    tier3_candidates[projectNumber] = {};
                                    tier3_candidates[projectNumber]["projectInfo"] = projectInfo[0];
                                    var long2 = parseInt(projectInfo[0].Longitude);
                                    if (x_list[long2] == undefined) {
                                        x_list[long2] = [];
                                        x_list[long2].push(projectNumber);
                                    }
                                    else {
                                        x_list[long2].push(projectNumber);
                                    }
                                    var lat2 = parseInt(projectInfo[0].Latitude);
                                    y_list[projectNumber] = lat2;
                                }
                                projectInfo = [];
                            }


                            for (i = 0; i < Object.keys(x_list).length; i++) {
                                key = Object.keys(x_list)[i];
                                if (x_list[key].length > 1) {

                                    for (j = 0; j < x_list[key].length; j++) {
                                        projectNumber = x_list[key][j];
                                        y_coordinate = y_list[projectNumber];
                                        if (y_list_reverse[y_coordinate] == undefined) {
                                            y_list_reverse[y_coordinate] = [];
                                            y_list_reverse[y_coordinate].push(projectNumber);
                                        } else {
                                            y_list_reverse[y_coordinate].push(projectNumber);
                                        }
                                    }

                                }
                            }

                            //y_list_reverse stores projects with same coordinates
                            aver_lat_tier3 = [];
                            aver_long_tier3 = [];

                            for (i = 0; i < Object.keys(y_list_reverse).length; i++) {

                                projectNo = y_list_reverse[Object.keys(y_list_reverse)[i]].length;
                                aver_lat_tier3.push(0);
                                aver_long_tier3.push(0);

                                if (projectNo > 1) { // to form tier 3 clusters
                                    index++;


                                    tier3_cluster["index"] = index;
                                    tier3_cluster["tierNo"] = 3;
                                    tier3_cluster["children"] = [];
                                    tier3_cluster["projects_Included"] = y_list_reverse[Object.keys(y_list_reverse)[i]];
                                    tier3_cluster["title"] = "";

                                    tier3_index = index;
                                    //add projects to each tier3 cluster
                                    for (j = 0; j < projectNo; j++) {
                                        projectIndex = y_list_reverse[Object.keys(y_list_reverse)[i]][j];
                                        formed[projectIndex] = true;
                                        index++;

                                        project = tier3_candidates[projectIndex]["projectInfo"];
                                        project_object["index"] = index;
                                        project_object["projectIndex"]= project.No;
                                        project_object["tierNo"] = 4;
                                        project_object["fcl_project"] = project.FCL_Project;
                                        project_object["case_study"] = project.Case_study;
                                        project_object["latitude"] = project.Latitude;
                                        project_object["longitude"] = project.Longitude;
                                        project_object["name"] = "<b>"+project.FCL_Project+"<br>"+ project.Case_study+"</b>";
                                        project_object["text"] = "<br><p>" + project.Title + "</p>" + "<p style='font-size: 12px;'>Coordinate: " + project.Latitude + "° N, " + project.Longitude + "°E <br>"
                                            +project.City+" , "+project.Country+"<br>"+ project.Description + "</p>";
                                        project_object["country"] = project.Country;
                                        project_object["city"] = project.City;
                                        project_object["parentIndex"] = tier3_index;
                                        project_object["size"] = size_unit;

                                        aver_lat_tier3[i] += Number(project.Latitude);
                                        aver_long_tier3[i] += Number(project.Longitude);
                                        tier3_cluster["children"].push(project_object);
                                        project_object = {};
                                    }

                                    tier3_cluster["longitude"] = aver_long_tier3[i] / projectNo;
                                    tier3_cluster["latitude"] = aver_lat_tier3[i] / projectNo;

                                    tier2_cluster["children"].push(tier3_cluster);
                                    tier3_cluster = {};

                                }

                            }// end of tier 3 formation


                            //to build projects for other non-tier3 projects
                            for (j = 0; j < tier1_children_proNo; j++) {
                                projectIndex = projectsIncluded[j];
                                if (formed[projectIndex] == false) {
                                    formed[projectIndex] = true;
                                    index++;

                                    project = tier3_candidates[projectIndex]["projectInfo"];
                                    project_object["projectIndex"] = project.No;
                                    project_object["index"] = index;
                                    project_object["tierNo"] = 4;
                                    project_object["fcl_project"] = project.FCL_Project;
                                    project_object["case_study"] = project.Case_study;
                                    project_object["latitude"] = project.Latitude;
                                    project_object["longitude"] = project.Longitude;
                                    project_object["name"] = "<b>"+project.FCL_Project+"<br>"+ project.Case_study+"</b>";
                                    project_object["text"] = "<br><p>" + project.Title + "</p>" + "<p style='font-size: 12px;'>Coordinate: " + project.Latitude + "° N, " + project.Longitude + "°E <br>"
                                        +project.City+" , "+project.Country+"<br>"+ project.Description + "</p>";
                                    project_object["country"] = project.Country;
                                    project_object["city"] = project.City;
                                    project_object["parentIndex"] = tier2_index;
                                    project_object["size"] = size_unit;

                                    tier2_cluster["children"].push(project_object);
                                    project_object = {};
                                }

                            }// end of forming non-tier3 projects

                            //SC.clustersCollection.push(tier2_cluster);
                            //tier2_cluster = {};

                            // tier2_cluster["children"].push(project_object);
                            //project_object = {};



                            tier1_cluster["children"].push(tier2_cluster);
                            tier2_cluster = {};
                        } else {

                            projectsIncluded = tier1_children["ProjectsIncluded"];
                            project_object["tierNo"] = 4;
                            project_object["projectIndex"] = projectsIncluded; // add in ptojects accordingly, 1-55
                            project_object["size"] = size_unit;

                            projectInfo = projects.filter(function (d) {
                                return Number(d.No) == Number(projectsIncluded);
                            });

                            if (projectInfo.length > 0) {
                                //FCL_Project,Case_study,Latitude,Longitude,Title,Description,Image_Credit,City,Country
                                project_object["fcl_project"] = projectInfo[0].FCL_Project;
                                project_object["case_study"] = projectInfo[0].Case_study;
                                project_object["longitude"] = projectInfo[0].Longitude;
                                project_object["latitude"] = projectInfo[0].Latitude;
                                project_object["name"] = "<b>"+projectInfo[0].FCL_Project+"<br>"+ projectInfo[0].Case_study+"</b>";
                                project_object["text"] = "<br><p>" + projectInfo[0].Title + "</p>" + "<p style='font-size: 12px;'>Coordinate: " + projectInfo[0].Latitude + "° N, " + projectInfo[0].Longitude + "°E <br>"
                                    +projectInfo[0].City+" , "+projectInfo[0].Country+"<br>"+ projectInfo[0].Description + "</p>";
                                project_object["country"] = projectInfo[0].Country;
                                project_object["city"] = projectInfo[0].City;
                                project_object["index"] = index;
                                project_object["parentIndex"] = tier1_index;
                            }

                            tier1_cluster["children"].push(project_object);
                            project_object = {};
                        }
                    }
                    SC.clustersCollection["children"].push(tier1_cluster);
                    tier1_cluster = {};
                }
            });
            //console.log(SC.clustersCollection);
            draw_circles();
        });

// JSON.parse converts json_string to an object
        //var obj = JSON.parse(SC.clustersCollection);
// JSON.stringify converts the object to a string again


        //var data = "{name: 'Bob', occupation: 'Plumber'}";
        /* var url = 'data:text/json;charset=utf8,' + encodeURIComponent(obj);
         window.open(url, '_blank');
         window.focus();*/

        //add the external circles
        /* for(i=1;i< clusterCount+1;i++) {

         number = clusterNumber[i];
         average_longitude[i] = average_longitude[i] / number;
         average_latitude[i] = average_latitude[i] / number;
         title = "<b>Cluster " + i + "</b>";
         text = title + "<br><br>Radius = " + (5 * number) +
         "<br>Project Number:  " + clusterNumber[i];
         //addpoint(color, average_longitude[i], average_latitude[i], title, text, number);
         }*/
    });

}


/*find tiers accroding to given distance*/
// 55 projects, index 0-54
function find_tier(matrix, tier_range, scale){

    var tier_status=[];// 1 indicates the corresponding project is included in tier1 already
    var check_status = []; //1 indicates checked alr for neighbours
    var stack = [];
    var neighbours = [];
    var value;


    //to create a neighbour matrix holding neighbours to each project
    for(var index =0;index<SC.projectNo;index++){

        neighbours.push([]);
        for(var i=0; i<SC.projectNo;i++){
            value = matrix[index][i];
            if(value<=tier_range && index !=i){ //index != i  to avoid same project distance
                neighbours[index].push(i);
            }
        }
    }

    //to classify projects into cluster
    for (var j=0;j<SC.projectNo;j++){
        tier_status.push(0);
        check_status.push(0);

    }


    var first_ofstack;
    var stack_length = 0;
    var neighbour_length;
    var neighbour_No;
    var looptime = 0;
    var clusterIndex = 1;
    var clusterNumber = [];
    var cluster_aver_lat = [];
    var cluster_aver_lon = [];

    clusterNumber.push(0,0);
    cluster_aver_lat.push(0);
    cluster_aver_lon.push(0);

    for(index = 0;index<SC.projectNo;index++){
        if(check_status[index]==0){
            if(looptime>1) {
                clusterIndex++;
                clusterNumber.push(0);
                cluster_aver_lat.push(0);
                cluster_aver_lon.push(0);
            }
            looptime =0;
            stack.push(index);
            stack_length++;

            while(stack_length > 0){
                looptime++;
                first_ofstack = stack.shift();
                stack_length--;

                if(check_status[first_ofstack] ==0){
                    check_status[first_ofstack] = 1;
                    neighbour_length =neighbours[first_ofstack].length;

                    if( neighbour_length> 0){
                        if(tier_status[first_ofstack]==0) {
                            tier_status[first_ofstack] = clusterIndex;
                            clusterNumber[clusterIndex]++;
                        }

                        for(i=0;i<neighbour_length;i++){
                            neighbour_No = neighbours[first_ofstack][i];
                            stack.push(neighbour_No);
                            stack_length++;
                            if(tier_status[first_ofstack]==0) {
                                tier_status[neighbour_No] = clusterIndex;
                                clusterNumber[clusterIndex]++;}
                        }

                    }
                }

            }

        }

    }
    clusterNumber.pop();

    var clusters = [];
    var clusterObj = {};
    var clusterCollection = [];

    var projects = SC.projects;
    var project ;

    for(i=0;i<clusterNumber.length;i++){
        clusters.push([]);

    }

    //sort projects in tier1_status according to cluster number, clusters[0] collects all projects with no cluster
    for(i=0;i< SC.projectNo;i++){
        index = tier_status[i];
        clusters[index].push(i+1); //represents actual project numbers, from 1 to 55
        project = projects[i];
        cluster_aver_lat[index] += Number(project["latitude"]);
        cluster_aver_lon[index] += Number(project["longitude"]);
    }


    //add in cluster objects
    var projectNo ;
    var name;
    var text;
    var clusterSort = [];

    for(i=1;i<clusterNumber.length;i++){
        projectNo = clusterNumber[i];
        cluster_aver_lat[i] = cluster_aver_lat[i]/projectNo;
        cluster_aver_lon[i] = cluster_aver_lon[i]/projectNo;

        clusterSort.push([i,projectNo]);
    }
    clusterSort.sort(function(a, b) {return b[1]-a[1];});

    //draw clusters
    for(i=0; i< clusterSort.length;i++){
        clusterIndex = clusterSort[i][0];
        projectNo = clusterSort[i][1];
        name = "Cluster "+clusterIndex;
        text = "Project Number="+projectNo;
        addcluster(6,cluster_aver_lat[clusterIndex],cluster_aver_lon[clusterIndex],name,text,projectNo,scale);
    }

    //draw non-clustered projects
    var length = clusters[0].length;
    var projectIndex;
    for (i=0;i<length;i++){
        projectIndex = clusters[0][i]-1;
        project = projects[projectIndex];
        addpoint(2,project["latitude"],project["longitude"],project["name"],project["text"],1,projectIndex+1,scale);
    }

}

//function to add clusters of projects
function addcluster(color_status, lat, lon, title,text, radius,scale) {

    if(radius == undefined) radius = 2;
    if(color_status==undefined) color_status = 6;


    var gpoint = g.append("g").attr("class","projects extra_info");
    var x = projection([lon,lat])[0];
    var y = projection([lon, lat])[1];
    var color_scheme = ["#CCFF99","#00FF00","#0000FF","#FFFF00","#00FFFF" ,
        "#FF00FF","#C0C0C0","#FFFFF1","#780000 ","996633"];

    gpoint.append("svg:circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("class", "cluster")
        .style("fill", function () {
            return color_scheme[color_status];
        }).style("opacity",0.4)
        .attr("r", radius_unit*radius)
        .on("mouseover", function () {

            var left = zoom.translate()[0];
            var top= zoom.translate()[1];
            var sc = zoom.scale();


            tooltip.attr("style", "right:" + (innerWidth-x*sc-left)+ "px;bottom:" +(innerHeight-y*sc-top)+ "px;visibility: visible")
                .html("<div id='tooltip_holder'><div id='tooltip_text' ><b>"
                    +title+"</b><br><p>"+text+"</p></div></div>");
        })
        .on("mouseout", function () {
            return tooltip.attr("style","visibility: hidden");
        })
        .on("click",function () {
            var x =   innerWidth/2 - projection([lon,lat])[0] *scale ;
            var y = innerHeight/2 - projection([lon,lat])[1] *scale;
            move([x,y],scale);

        });


}
