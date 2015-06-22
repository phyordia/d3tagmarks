function Node (name) {
    this.name = name;
    this.links = [];
    this.addUrl = function(aname, aurl) {
        this.links.push({name:aname, url:aurl});
    };
}



function getIndex(nodes, tag){
    for(n in nodes){
        if(nodes[n].name==tag) return nodes.indexOf(nodes[n]);
    }
    return -1;
}


// get the data
d3.csv("../../projects/d3tagmarks/bookmarks.txt", function(data) {

    var nodes = [];
    var links = [];
    var xdata = data.map(function(d,i) {
        return {title: d.title, url: d.url, tags: d.tags.split(";")};
    });

    xdata.forEach(function(d){
        // create a new node for each tag
        for(var t in d.tags){
            tag = d.tags[t];
            var nodeExists = false;
            var node;

            for(var n in nodes){
                var inode = nodes[n];
                if(inode.name == tag){
                    nodeExists = true;
                    node=inode;
                }
            }
            if(!nodeExists){
                node = new Node(tag)
                nodes.push(node);
            }
            node.addUrl(d.title, d.url);
        }

        //create links
        for(var i=0; i<d.tags.length-1;i++){
            for(var j=1; j<d.tags.length;j++){
                if(d.tags[i] == d.tags[j]) continue;
                idxs = getIndex(nodes, d.tags[i]);
                idxt = getIndex(nodes, d.tags[j]);
                var ilink = {source:idxs, target:idxt};
                var ilinkr = {source:idxt, target:idxs};
                if(links.indexOf(ilink)==-1 && links.indexOf(ilinkr)==-1) links.push(ilink);
            }
        }

    });


    //console.log(links);
    //console.log(links);
    var width = 600,
        height = 600;

    var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance(150)
        .charge(-500)
        .on("tick", tick)
        .start();

// Set the range
    var  v = d3.scale.linear().range([0, 100]);

// Scale the range of the data
    v.domain([0, d3.max(links, function(d) { return d.value; })]);


    var svg = d3.select("#viz").append("svg")
        .attr("width", width)
        .attr("height", height);



// add the links and the arrows
    var path = svg.append("svg:g").selectAll("path")
        .data(force.links())
        .enter().append("svg:path")
        .attr("class", function(d) { return "link " + d.type; });
    //.attr("marker-end", "url(#end)");


// define the nodes
    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .on("click", click)
        //.on("dblclick", dblclick)
        .call(force.drag);

// add the nodes
    node.append("circle").attr("r", function(d){ return 10+3*d.links.length ;});
    node.append("active").text(0);

// add the text
    node.append("text")
        .attr("x", 0)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.name; });


    node.append("links").html(function(d){
        var txt = "";
        for(l in d.links){
            var tags = "(";
            for(var x in xdata){
                if(xdata[x].url == d.links[l].url){
                    for(var t in xdata[x].tags){
                        itag=xdata[x].tags[t]
                        tags += itag+(itag==xdata[x].tags[xdata[x].tags.length-1]?")":", ");
                    }
                }
            }

            txt += "<li><a target=\"_blank\" href=\""+d.links[l].url+"\"><strong>"+d.links[l].name+"</strong> "+tags+"</a></li>";
        }
        return txt;
    });



// add the curvy lines
    function tick() {
        path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;
        });

        node
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")"; });
    }





// action to take on mouse click
    function click() {
        var displaylinks = d3.select("#displaylinks");

        var selr = 10+8*d3.select(this).datum().links.length;

//unselect the active circle
        var selc = d3.select(".selcircle");
        var rold = selc.empty() ? 1:10+3*selc.datum().links.length;
        selc.classed("selcircle", false)
            .transition()
            .duration(500)
            .attr("r", rold);

        d3.select(".seltext").classed("seltext",false).attr("fill","#000");

        //add selected circle values
        d3.select(this).select("circle")
            .classed("selcircle", true)
            .transition()
            .duration(500)
            .attr("r", selr);
        d3.select(this).select("text")
            .classed("seltext",true).attr("fill","#000");



        links = d3.select(this).select("links").html();

        displaylinks.html("<h1>Links</h1><ul>"+links+"</ul>");

    }



});
