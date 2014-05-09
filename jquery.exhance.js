/*
Exhance v1.0.0

http://dev.tthe.se/exhance

Copyright (c) 2014 Tomas Thelander
Licensed under the MIT license
*/
(function($) {
    $.fn.Exhance = function(input) {
        if (this.length == 0) return;
        
        if (typeof input == 'object' || input == null)
        {
            var options = $.extend({
                'ajax' : false,
                'box' : false,
                'boxBlock' : false,
                'boxMenu' : true,
                'indent' : 30,
                'hover' : false,
                'links' : true,
                'placeholder' : '%exhance%',
                'pre' : false,
                'src' : false,
                'type' : 'json',
                'wrapper' : '%exhance%',
                'write' : true,
                'xmlComments' : true
            },input);
            
            var printString = function(str) {
                var patternFirst = new RegExp('^https?:\\/\\/');
                var patternFull = new RegExp('^(https?:\\/\\/)?'+ // protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
                
                if (options.links)
                {
                    if (str.match(patternFirst))
                    {
                        if (str.match(patternFull))
                        {
                            return '<a href="'+ str +'">'+ str +'</a>';
                        }
                    }
                    
                }
                return str;
            };
            
            var level = 0;
            
            /* Recursive function for creating colorful JSON */
            var printJson = function(obj, comma)
            {
                /* Print [arrays] */ 
                if (Object.prototype.toString.call(obj) === '[object Array]')
                {
                    var string = '<div class="exhance-inline">[</div>'+"\n";
                    
                    level++;
                    // Loops through the contents of the array, recursively calling printJson again
                    for (i = 0; i < obj.length; i++)
                    {
                        if (i == obj.length-1) appendComma = false;
                        else appendComma = true;
                        
                        string += Array(level+1).join("\t")+'<div class="exhance-indent" style="margin-left:'+options.indent+'px;"><span class="exhance-bg">'+ printJson(obj[i], appendComma) +'</span></div>';
                    }
                    level--;
                    string += Array(level+1).join("\t")+'<div style="margin-left: 0px;" class="exhance-inline">]</div>';
                    
                    if (comma)
                    {
                        string += ',';
                    }
                    
                    return string+"\n";
                }
                /* Print {objects} */
                else if (typeof obj == 'object' && obj != null)
                {
                    var string = '<div class="exhance-inline">{</div>'+"\n";
                    
                    var count = 0;
                    for (var name in obj)
                    {
                        if (obj.hasOwnProperty(name))
                        {
                            count++;
                        }
                    }
                    
                    var i = 1;
                    level++;
                    // Loops through the object
                    for (var name in obj)
                    {
                        // Only actual properties should be handled, not properties inherited
                        if (obj.hasOwnProperty(name))
                        {
                            if (count == i) appendComma = false;
                            else appendComma = true;
                            
                            // Recursively appends object contents
                            string += Array(level+1).join("\t")+'<div class="exhance-indent" style="margin-left:'+options.indent+'px;"><span class="exhance-bg"><span class="exhance-property">"'+ name +'"</span> : '+ printJson(obj[name], appendComma) +'</span></div>';
                        }
                        
                        i++;
                    }
                    level--;
                    
                    string += Array(level+1).join("\t")+'<div style="margin-left:0px;" class="exhance-inline">}</div>';
                    
                    if (comma) string += ',';
                    
                    return string+"\n";
                }
                /* Print "strings" */
                else if (typeof obj == 'string')
                {
                    return '<span class="exhance-string">"'+ printString(obj) +'"</span>' + (comma ? ',' : '')+"\n";
                }
                
                /* Print numbers */
                else if (typeof obj == 'number')
                {
                    return '<span class="exhance-number">' + obj.toString() + '</span>' + (comma ? ',' : '')+"\n";
                }
                /* Print booleans */
                else if (typeof obj == 'boolean')
                {
                    return '<span class="exhance-boolean">' + obj.toString() + '</span>' + (comma ? ',' : '')+"\n";
                }
                /* Print null */
                else if (typeof obj == 'object' && obj == null)
                {
                    return '<span class="exhance-null">null</span>' + (comma ? ',' : '')+"\n";
                }
                /* Unknown type */
                else
                {
                    return 'undefined' + (comma ? ',' : '')+"\n";
                }
                
            };
            
            /* Recursive function for creating colorful JSON */
            var printXml = function(element)
            {
                var returnString = '';
                var xlevel = 0;
                var last = null;
                
                $(element).contents().each (function processNodes() {
                    xlevel++;
                    
                     // The first level tag should not be indented
                    if (xlevel > 1)
                    {
                        indentString = '<div class="exhance-indent" style="margin-left: '+options.indent+'px;"><div class="exhance-bg">';
                    }
                    else
                    {
                        indentString = '<div><div class="exhance-bg">';
                    }
                    
                    // Text node
                    if (this.nodeType == 3)
                    {
                        returnString += '<span class="exhance-x-text">' + printString(this.nodeValue) + '</span>';
                        last = 'txt';
                    }
                    // CDATA
                    else if (this.nodeType == 4)
                    {
                        returnString += indentString + '<span class="exhance-x-cdata">&lt;![CDATA[' + this.nodeValue.replace(/</g,'&lt;').replace(/>/g,'&gt;') + ']]&gt;</span></div></div>';
                    }
                    // Comment
                    else if (this.nodeType == 8)
                    {
                        if (options.xmlComments)
                        {
                            returnString += indentString + '<span class="exhance-x-comment">&lt;!--' + this.nodeValue + '--&gt;</span></div></div>';
                        }
                    }
                    // XML tag
                    else if (this.nodeType == 1)
                    {
                        returnString += indentString;
                        
                        // Adding linebreaks and tabs at the right places
                        if ((last != 'txt' && xlevel > 1) || last == 'end')
                        {
                            returnString += "\n" + Array(xlevel).join("\t");
                        }
                        
                        // Building start tag, including attributes
                        returnString += '<span class="exhance-x-lt">&lt;</span><span class="exhance-x-tagname">' + this.tagName + '</span>';
                        for (var i = 0; i < this.attributes.length; i++)
                        {
                            returnString += ' <span class="exhance-x-attrname">' + this.attributes[i].name + '</span><span class="exhance-x-attreq">=</span><span class="exhance-x-attrval">"' + printString(this.attributes[i].nodeValue) + '"</span>';
                        }
                        returnString += '<span class="exhance-x-gt">&gt;</span>';
                        last = 'start';
                        
                        // Recursive call for adding children
                        $(this).contents().each(processNodes);
                        
                        // More linebreaks and tabs
                        if (last != 'txt' && last != 'start')
                        {
                            returnString += "\n" + Array(xlevel).join("\t");
                        }
                        
                        // End tag
                        returnString += '<span class="exhance-x-lt">&lt;/</span><span class="exhance-x-tagname">' + this.tagName + '</span><span class="exhance-x-gt">&gt;</span></div></div>';
                        last = 'end';
                    }
                    xlevel--;
                });
                
                return returnString;
            };
            
            /* Loop through the selected elements */
            this.each(function(i, e){
                $(e).removeClass('exhance-error');
                
                // Remove white-space: pre if present
                if ($(e).data().pre)
                {
                    $(e).removeClass('exhance-pre');
                    $(e).data('pre',false);
                }
                
                // Content type is JSON
                if (options.type == 'json')
                {
                    /*
                    The JSON is taken from the specified source if there is any,
                    otherwise the contents of the selected div is taken.
                    
                    If the div containing the JSON already has been altered with this plugin and
                    should be recreated we use the JSON saved in the data object, otherwise we
                    use the contents of the div.
                    */
                    if (options.src)
                    {
                        if (options.ajax)
                        {
                            $(e).html('Retrieving data...').addClass('exhance-container');
                            $.ajax({
                                type: "GET",
                                url: options.src,
                                dataType: "text",
                                success: function(json){
                                    $(e).data('exhancePre',$.trim(json));
                                    options.src = options.ajax = false;
                                    $(e).Exhance(options);
                                },
                                error : function(){
                                    $(e).html('Exhance Ajax: An error occured when retrieving data.').addClass('exhance-error');
                                }
                            });
                            return;
                        }
                        else
                        {
                            var plaintext = $.trim($('#'+options.src).html());
                        }
                    }
                    else
                    {
                        if ($(e).data().exhancePre)
                        {
                            var plaintext = $(e).data().exhancePre;
                        }
                        else
                        {
                            var plaintext = $(e).html();
                        }
                    }
                    
                    // Attempting to parse JSON
                    try {
                        var data = $.parseJSON(plaintext);
                    }
                    catch(err) {
                        $(e).html('Error parsing JSON.').addClass('exhance-container').addClass('exhance-error');
                        return;
                    }
                    
                    // A global counter used when generating JSON.
                    level = 0;
                    // Creating colorful JSON
                    var firstwrapper = options.wrapper.substr(0,options.wrapper.indexOf(options.placeholder));
                    var lastwrapper = options.wrapper.substr(options.wrapper.indexOf(options.placeholder) + options.placeholder.length);
                    var styledData = printJson(data);
                    
                    // Saving data
                    $(e).data('exhancePre',styledData.replace(/(<([^>]+)>)/ig,""));
                    $(e).data('exhanceObj',data);
                }
                // Content type is XML
                else if (options.type == 'xml')
                {
                    /*
                    I found it to be a better solution to use native XML parsing than the one in jQuery.
                    */
                    var parseXml;
                    if (typeof window.DOMParser != "undefined") {
                        parseXml = function(xmlStr) {
                            return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
                        };
                    } else if (typeof window.ActiveXObject != "undefined" &&
                           new window.ActiveXObject("Microsoft.XMLDOM")) {
                        parseXml = function(xmlStr) {
                            var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
                            xmlDoc.async = "false";
                            xmlDoc.loadXML(xmlStr);
                            return xmlDoc;
                        };
                    } else {
                        throw new Error("No XML parser found");
                    }
                    
                    /*
                    The XML is taken from the specified source if there is any,
                    otherwise the contents of the selected div is taken.
                    
                    If the div containing the XML already has been altered with this plugin
                    we restore the original XML contents to the div.
                    */
                    if (options.src)
                    {
                        if (options.ajax)
                        {
                            $(e).html('Retrieving data...').addClass('exhance-container');
                            $.ajax({
                                type: "GET",
                                url: options.src,
                                dataType: "xml",
                                success: function(xml){
                                    $(e).data('exhanceObj',xml);
                                    options.src = options.ajax = false;
                                    $(e).Exhance(options);
                                },
                                error : function(){
                                    $(e).html('Exhance Ajax: An error occured when retrieving data.').addClass('exhance-error');
                                }
                            });
                            return;
                        }
                        else
                        {
                            data = parseXml('<exhance>' + $('#'+options.src).html() + '</exhance>').childNodes;
                        }
                    }
                    else
                    {
                        if ($(e).data().exhanceObj)
                        {
                            data = $(e).data().exhanceObj;
                        }
                        else if ($(e).data().exhanceXml)
                        {
                            data = parseXml($(e).data().exhanceXml);
                        }
                        else
                        {
                            data = parseXml($(e).html());
                        }
                    }
                    
                    var firstwrapper = '';
                    var lastwrapper = '';
                    var styledData = printXml(data);
                    
                    // Saving data
                    $(e).data('exhancePre',styledData.replace(/(<([^>]+)>)/ig,""));
                    $(e).data('exhanceXml',$(e).data().exhancePre.replace(/&lt;/gi,'<').replace(/&gt;/gi,'>'));
                    $(e).data('exhanceObj',data);
                }
                else
                {
                    return;
                }
                
                // The full styled HTML string
                var fullStyled = '<span class="exhance-wrapper">'+ firstwrapper +'</span>' + styledData + '<span class="exhance-wrapper">'+ lastwrapper +'</span>';
                
                // Writing the generated content
                if (options.write)
                {
                    // The slightly more fancy design with bgcolor, border and switchable conent
                    if (options.box)
                    {
                        $(e).html('<div class="exhance-box"><div class="exhance-menu"></div><span class="exhance-bg"></span></div>').addClass('exhance-container');
                        $(e).find('.exhance-menu').append('<a href="#" class="showColor">Colored</a><span class="menuSeparator"> | </span><a href="#" class="showPlain">Plain</a><span class="menuSeparator"> | </span><a href="#" class="minimize">Show/hide</a>');
                        
                        // If the box should be a block, i.e. 100% width, instead of inline-block
                        if (options.boxBlock)
                        {
                            $(e).find('.exhance-box').css('display','block');
                        }
                        
                        // The link that switches the content to the colorful generated HTML
                        $(e).find('.showColor').click(function(ev){
                            ev.preventDefault();
                            $(e).removeClass('exhance-pre');
                            $(e).find('.exhance-bg:first').html(fullStyled);
                            
                            if (options.hover)
                            {
                                $(e).Exhance('hover');
                            }
                        });
                        
                        // The link that switches the content to the pre-formatted plain text
                        $(e).find('.showPlain').click(function(ev){
                            ev.preventDefault();
                            $(e).addClass('exhance-pre');
                            $(e).find('.exhance-bg:first').html($(e).data().exhancePre);
                            
                            if (options.hover)
                            {
                                $(e).Exhance('disableHover');
                            }
                        });
                        
                        // The link that minimizes the container
                        $(e).find('.minimize').click(function(ev){
                            ev.preventDefault();
                            $(e).find('.exhance-bg:first').slideToggle();
                            $(e).find(' .showColor, .showPlain, .menuSeparator').toggle();
                        });
                        
                        // If the menu should be hidden
                        if (!options.boxMenu)
                        {
                            $(e).find('.exhance-menu').hide();
                        }
                    }
                    // No fancy box, just the colorful HTML
                    else
                    {
                        $(e).html('<span class="exhance-bg"></span>').addClass('exhance-container');
                    }
                    
                    // Adding content
                    $(e).find('.exhance-bg').html(fullStyled);
                }
                
                // Applying hover effect
                if (options.hover)
                {
                    $(e).Exhance('hover');
                }
                
                // No colorcoding, only pre-formatted (\n and \t added) should be displayed
                if (options.pre && options.write && !options.box)
                {
                    $(e).Exhance('pre');
                }
                // Fancy box enabled and the plain text should be the default view
                else if (options.pre && options.write && options.box)
                {
                    $(e).find('.showPlain').click();
                }
            });
        }
        /*
        Removes all colorful HTML with only pre-formatted plain text remaining
        */
        else if (input == 'pre')
        {
            this.each(function(i,e){
                $(e).html($(e).data('exhancePre')).addClass('exhance-pre');
                $(e).data('pre',true);
            });
        }
        /*
        Applying hover events using mouseover/mouseleave events
        */
        else if (input == 'hover')
        {
            this.each(function(i,e){
                $(e).find('.exhance-bg').on('mouseover',function(ev){
                    ev.stopPropagation();
                    $(e).find('.exhance-bg').removeClass('exhance-indenthover');
                    $(this).addClass('exhance-indenthover');
                }).on('mouseleave',function(ev){
                    ev.stopPropagation();
                    $(this).removeClass('exhance-indenthover');
                });
            });
        }
        /*
        Removes the hover effect
        */
        else if (input == 'disableHover')
        {
            this.each(function(i,e){
                $(e).find('.exhance-bg').off('mouseover').off('mouseleave');
            });
        }
        /*
        Returns the raw data, formatted with newlines and tabs
        */
        else if (input == 'data')
        {
            return this.data().exhanceXml ? this.data().exhanceXml : this.data().exhancePre;
        }
        
        return this;
    };
})(jQuery);