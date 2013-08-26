# oas_visual.jQuery

a jQuery plugin for visualisation of aggregated OAS data on a repository page

## Installation

Copy files to public accessible path on your repository.

## Configuration

### [trend.css](trend.css)

Include ````trend.css````.

### [Chart.js](js/Chart.js)

Include ````js/Chart.js```` in html page (before! ````.oas_visual()```` should be called).

### [getTendenz.php](getTendenz.php)

Replace ````_server_oas_JsonGet_path_```` in ````$oasURL```` with http-path to index.php file from [oas_JsonGet](../oas_JsonGet) package.
Install and activate php-curl (if not already done).

### [getRelevantEntrys.php](getRelevantEntrys.php)

Write your own. It's only an example. Documentation of data format:

####data format

 ````php
 	[
    	initiator:{
            count_swd(number of keywords),
            title(string),
            id(number),
            date(timestamp)
        },
        
        data[
        	0:{
            	count_swd,
                title,
                id,
                date
            }
            1:{...}
            ...
            $limit:{...}
        ]
     ]
 ````

### js/oas_stats_plugin.js

Configuration is made by calling jQuery plugin like this:

  ````javascript
  $(document).ready(function(){
	  $('#frontdoorMeta').oas_visual({'ID': id, 'CSS': {'margin-top': '2ex'}});
	});
  ````
#### jQuery plugins options

 * ``WRAP_INTO``: HTML-container for the whole plugin. E.g. ``'<div>'``.
 * ``CSS``: CSS-code of the ``WRAP_INTO`` object.
 * ``INSERT_TYPE`` [**``'before'``**, ``'after'``, ``'into'``]: Default ``'before'``. The plugin appears before/after/into the call-object.
 * ``LANG`` [**``'de'``**, ``'en'``]: Default ``'de'``. Will be set automatically, if the GET-parameter ``la`` is available.
 * ``PATH``: Subdirecotry in your repository.
 * ``ID``: Must be set to desired ID.
 * ``ID_PREFIX``: Could be set, if the oas-interface expects a constant ID-prefix.
 * ``OAS_BEGIN_DATE`` [``Date``-object]: From this date, the score is calculated.
 * ``LIMIT_RELEVANT_ENTRYS``: Default ``15``. Number of relevant documents shown in the relevance tab.
 * ``TENDENZ_ROW_CONTROL``: activates/deactivates the rows in relevance tab.
    ````javascript
    {'7days':0,'30days':1,'4month':1,'1year':1}
    ````
 * ``TAB_CONTROL``: activates/deactivates the tabs.
    ````javascript
    {'trend':1,'chart':1,'relevance':1}
    ````
 * ``CHART_MONTH_CONTROL`` [``1``-``12``]: Number of month shown in the chart.
 * ``DOCUMENT_URL``: The URL to the all documents. Only relevant in the relevance tab. {0} is a wild-card character for the id and {1} is a wild-card character for the language.
    ````javascript
    	{'DOCUMENT_URL': '/frontdoor?id={0}&language={1}'}
	````
 * ``TENDENCE_URL``: The URL to the getTendenz.php script. {0} is a wild-card character for the id prefix, {1} is a wild-card character for the id, {2} is a wild-card character for the type and {3} is a wild-card character for the time period.
    ````javascript
    	{'TENDENCE_URL': '/getTendenz.php?id={0}{1}&u={2}&n={3}'}
    ````
 * ``RELEVANCE_URL``: The URL to the getRelevantEntrys.php script. {0} is a wild-card character for the id and {1} is a wild-card character for the limit.
    ````javascript
    	{'RELEVANCE_URL': '/getRelevantEntrys.php?id={0}&limit={1}'}
    ````
 * ``CSS_URL``: The URL to the trend.css file.

## License 

Licensed under the MIT license.
