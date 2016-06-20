/*
* @File: generic-protein-expression-view.js
* @Description: Generic protein expression view for Human Body
* @Author: JinJin Lin
* @Email:   jinjin.lin@outlook.com
* @Date:   2016-03-12 15:20:55
* @Last Modified time: 2016-05-08 20:44:24
* All copyright reserved
*/

;(function(global) {

    'use strict';

    var HeatMapTable = function(argv) {
        return new HeatMapTable.init(argv);
    }

    HeatMapTable.prototype = {

        initHandlebars : function() {
            var self = this;
            //Share template for recursively generate children
            Handlebars.registerPartial('create-children', HBtemplates['templates/heatmap-tree.tmpl']);

            Handlebars.registerHelper('createIcon', function(data) {
                if (data.children.length > 0 || (data.detailData && data.detailData.length > 0)) {
                    return new Handlebars.SafeString('<span class="glyphicon glyphicon-plus"></span>');
                }
                return new Handlebars.SafeString('<span class="glyphicon glyphicon-record"></span>');
            });

            Handlebars.registerHelper('showValue', function(value, block) {
                var accum = '';

                var valueHtml = '<div class="heatmap-column {{columnClass}}", style="width:{{columnWidth}}">{{{valueStyle}}}</div>';
                var circleHtml = '<i class="heatmap-circle {{circleColorClass}}" style="background-color: {{circleColorStyle}}"></i>';
                var valueTemplate = Handlebars.compile(valueHtml);
                var circleTemplate = Handlebars.compile(circleHtml);

                var result = {};
                // result.columnClass = self.header[i].toLowerCase();
                result.columnWidth = self.columnWidth;
                if (self.valueToStyle[value]) {
                    if (self.valueToStyle[value].cssClass) {
                        result.circleColorClass = self.valueToStyle[value].cssClass;
                    } else if (self.valueToStyle[value].color) {
                        result.circleColorStyle = self.valueToStyle[value].color;
                    } else if (self.valueToStyle[value].html) {
                        result.valueStyle = self.valueToStyle[value].html;
                        return new Handlebars.SafeString(valueTemplate(result));
                    }
                } else {
                    result.circleColorStyle = "black";
                }
                result.valueStyle = circleTemplate(result);
                return new Handlebars.SafeString(valueTemplate(result));
            });

            Handlebars.registerHelper('addDetail', function(detailData) {
                var source   = $('#'+self.detailTemplate).html();
                var template = Handlebars.compile(source);
                return new Handlebars.SafeString(template(detailData));
            });

           Handlebars.registerHelper('heatmapCreateHeader', function() {
                var source   = $('#'+self.headerTemplate).html();
                var template = Handlebars.compile(source);
                return new Handlebars.SafeString(template(self.headerTemplateData));
            });
        },

        showHeatMapSkeleton: function() {
            var template = HBtemplates['templates/heatmap.tmpl'];
            var skeleton = template(this.data);
            $(this.heatmapTable).append(skeleton);
        },

        showRows : function() {
            var rows = HBtemplates['templates/heatmap-tree.tmpl'](this.data);
            $(this.heatmapTable).find(".heatmap-rows").empty().append(rows);

            this.initClickEvent();
        },

        expandByFilterString: function(root, filterString) {
            var children = root.children("li");
            var found = false;
            var rowLabel = root.parent().children(".heatmap-row").children(".heatmap-rowLabel").children(".rowLabel").text();
            for (var i = 0; i < children.length; i++) {
                found |= this.expandByFilterString($(children[i]).children(".heatmap-closed"), filterString);
            }
            if (found) {
                root.show()
                   .toggleClass("heatmap-closed heatmap-opened")
                   .parent().children(".heatmap-row").find(".glyphicon").toggleClass("glyphicon-plus glyphicon-minus");
            }
            return found || rowLabel.toLowerCase().indexOf(filterString.toLowerCase()) !== -1
        },

        initClickEvent : function() {
            var self = this;
            //Collapse the table in the begining
            $(self.heatmapTable).find('.heatmap-rowLabel').parent().parent().children('ul.tree').toggle();

            $(self.heatmapTable).find('.heatmap-rowLabel').click(function () {
                $(this).find(".glyphicon").toggleClass("glyphicon-plus glyphicon-minus")
                $(this).parent().parent().children('ul.tree').toggleClass("heatmap-closed heatmap-opened").toggle(300);
            });

            //Add the click event of collapseAll button
            $(self.heatmapTable).find(".heatmap-collapseAll-btn").click(function() {
                $(self.heatmapTable).find(".heatmap-opened").each(function() {
                    $(this).hide()
                           .toggleClass("heatmap-opened heatmap-closed")
                           .parent().children(".heatmap-row").find(".glyphicon").toggleClass("glyphicon-minus glyphicon-plus");
                });
            });

            // //Add the click event of expandAll button
            $(self.heatmapTable).find(".heatmap-expandAll-btn").click(function() {
                $(self.heatmapTable).find(".heatmap-closed").each(function() {
                    $(this).show()
                           .toggleClass("heatmap-closed heatmap-opened")
                           .parent().children(".heatmap-row").find(".glyphicon").toggleClass("glyphicon-plus glyphicon-minus");
                });
            })

            $(self.heatmapTable).find(".heatmap-reset-btn").click(function() {
                self.data = self.originData;
                self.showRows();
            });

            $(self.heatmapTable).find(".heatmap-filterByRowName-search").click(function() {
                var filterString = $(self.heatmapTable).find(".heatmap-filterByRowName-input").val();
                if (filterString === "") return ;

                self.data = self.filterByRowsLabel(filterString);
                self.showRows();
                self.expandByFilterString($(self.heatmapTable).find(".heatmap-rows"), filterString);
                if (self.data['children'].length === 0) {
                    $(self.heatmapTable).find(".heatmap-rows").append("<p>No result be found.</p>");
                }
            });

            // $(self.heatmapTable).find(".heatmap-zoom").each(function() {
            //     $(this).click(function() {
            //         $(this).parent().parent().parent().children(".heatmap-detail").toggle();
            //         $(this).toggleClass("glyphicon-zoom-out", "glyphicon-zoom-in");
            //     });
            // });
        },

        loadJSONData : function(data) {
            this.originData = {};
            this.originData['children'] = data.data;
            this.data = this.originData;
            // this.data.header = this.header;
            // this.data.headerGroups = this.headerGroups;
        },

        loadJSONDataFromURL : function(filePath) {
            var self = this;
            $.getJSON(filePath, function(data) {
                self.loadJSONData(data);
            });
        },

        show : function() {
            this.initHandlebars();
            this.showHeatMapSkeleton();
            this.showRows();
        },

        getValueToStyle: function(valuesColorMapping) {
            var valueToStyle = {}
            for (var i = 0; i < valuesColorMapping.length; i++) {
                valueToStyle[valuesColorMapping[i].value] = {};
                if (valuesColorMapping[i].color) {
                    valueToStyle[valuesColorMapping[i].value].color = valuesColorMapping[i].color;
                } else if (valuesColorMapping[i].cssClass) {
                    valueToStyle[valuesColorMapping[i].value].cssClass = valuesColorMapping[i].cssClass;
                } else if (valuesColorMapping[i].html) {
                    valueToStyle[valuesColorMapping[i].value].html = valuesColorMapping[i].html;
                } else {
                    throw "The value" + values[j].value + "has no color or cssClass";
                }
            }
            return valueToStyle
        },

        filterByRowsLabel: function(filterString) {
            return {"children": this.filter(this.originData.children, filterString)};
        },

        filter: function(data, filterString) {
            var newData = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].rowLabel.toLowerCase().indexOf(filterString.toLowerCase()) !== -1) {
                    newData.push(data[i]);
                } else if (data[i].children && data[i].children.length !== 0) {
                    var newChildren = this.filter(data[i].children, filterString);
                    if (newChildren.length !== 0) {
                        data[i].children = newChildren;
                        newData.push(data[i]);
                    }
                }
            }
            return newData;
        },
    }

    HeatMapTable.init = function(argv) {
        this.originData = {};
        this.data = {};
        this.heatmapTable = $("#" + argv.tableID)[0];
        if (argv.options) {
            this.detailTemplate = argv.options.detailTemplate;
            this.headerTemplate = argv.options.headerTemplate;
            this.headerTemplateData = argv.options.headerTemplateData;
            this.columnWidth = argv.options.columnWidth || "70px";
            this.valueToStyle = this.getValueToStyle(argv.options.valuesColorMapping);
        }
    }

    HeatMapTable.init.prototype = HeatMapTable.prototype;

    global.HeatMapTable = HeatMapTable;

}(window));