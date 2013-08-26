<?php
/* getRelevantEntrys.php -- show relevant documents based on given document id 
 * (example! for opus 3 by using swd_subject)
 *
 * @author Robert Kolatzek <r.koaltzek+github@sulb.uni-saarland.de> + Cornelius Leidinger <cornelius.leidinger@googlemail.com>,
           Saarlaendische Universitaets- und Landesbibliothek, Saarbruecken
 * Copyright (C) 2013 Saarland University, Saarbruecken, Germany
 *
 * @license MIT
 * The MIT License (MIT)
 * 
 * Copyright (c) 2013 SULB
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 */
 

 function strToArray($str,$delimiter=',;'){
	return preg_split("/[".$delimiter."]/",$str,-1,PREG_SPLIT_NO_EMPTY);
 }

 $id = intval($_GET["id"]);
 $limit = 100;
 $limit = intval($_GET["limit"]);
 if($limit>200) $limit = 200;
 
 $json_arr = array();
 
 $connection = mysql_connect($server, $username, $password);
 $res = mysql_query("SELECT `subject_swd`, `date_creation`, `title` FROM `opus` WHERE `source_opus`='".$id."'");
 $mrow = mysql_fetch_row($res);
 
 $swd_arr = strToArray($mrow[0]);
 $date = $mrow[1];
 $title = $mrow[2];
 
 if((strlen(trim($mrow[0])) == 0) || (!isset($mrow[0]))){
	$json_arr["initiator"] = array("count_swd"=>0, "title"=>$title, "id"=>$id, "date"=>$date);
	$json_arr["data"] = array();
	echo json_encode($json_arr);
	exit();
 }
 
 $from = "";
 foreach($swd_arr as $a){
	if(strlen($from)==0){
		$from .= "(SELECT `subject_swd`, `title`, `source_opus`, `date_creation` FROM `opus` WHERE `subject_swd` REGEXP '[[:<:]]".trim($a)."[[:>:]]')";
	}
	else{
		$from .= "UNION ALL (SELECT `subject_swd`, `title`, `source_opus`, `date_creation` FROM `opus` WHERE `subject_swd` REGEXP '[[:<:]]".trim($a)."[[:>:]]')";
	}
 }
 $query = "SELECT *,COUNT(*) as cnt FROM (".$from.") as z WHERE source_opus != '".$id."' GROUP BY `source_opus` ORDER BY cnt DESC LIMIT 0,". $limit;
 $res = mysql_query($query);
 $sortedDocumentArray = array();
 while($mrow = mysql_fetch_row($res)){
	if($mrow[2] == $id){
		continue;
	}
	$sortedDocumentArray[] = array("count_swd"=>$mrow[4],"title"=>$mrow[1],"id"=>$mrow[2],"date"=>$mrow[3]);
 }
 
 $json_arr["initiator"] = array("count_swd"=>count($swd_arr), "title"=>$title, "id"=>$id, "date"=>$date);
 $json_arr["data"] = $sortedDocumentArray;
 echo json_encode($json_arr);
/*
 * For documentation of this data format please consult the pdf file!
 */ 
?>