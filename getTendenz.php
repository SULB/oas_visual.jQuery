 <?php
/* getTendenz.php -- a transparent proxy to index.php from oas_JsonGet
 * Needed because of Same Origin Policy in browsers using AJAX
 *
 * @author Cornelius Leidinger <cornelius.leidinger@googlemail.com> + Robert Kolatzek <r.koaltzek+github@sulb.uni-saarland.de>,
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
 
 $oasURL = "http://_server_oas_JsonGet_path_";
 
 $id = $_GET["id"];
 $u = $_GET["u"];
 $n = $_GET["n"];
 
 
 $ch = curl_init();
 
 curl_setopt($ch, CURLOPT_URL, $oasURL."?id=".$id."&u=".$u."&n=".$n);
 curl_setopt($ch, CURLOPT_HEADER,0);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
  
  $var = curl_exec($ch);
  echo $var;
  
  curl_close($ch);
 ?>