<%@ page import="edu.harvard.capstone.parser.Equipment" %>
<%@ page import="edu.harvard.capstone.editor.ExperimentalPlateSet" %>
<%@ page import="edu.harvard.capstone.user.Scientist" %>

	<!-- Highlight / Error -->
	<div id="userMsgPanel" ></div>
	<div class="col-sm-12">
			<!-- TABS -->				
				<div id="tabs" >
                    <ul style="background-color:#d9edf7;" >
                        <li><a href="#parsingTab">Parsing</a></li>
                        <li><a href="#plateTab">Plate</a></li>
                        <li><a href="#featuresTab">Features</a></li>
                        <li><a href="#plateIDSelection">Experiment</a></li>
                    </ul>
                    <div id="parsingTab">
                    	<div>
                    		<h4>
                    			<table class="table"  >
								  <tr >
								    <th style="padding-bottom:7px;width:50%;" colspan="2">
								    	<input type="hidden" id="parsingId" autocomplete="off"/>
										<label for="selectedFile">Example File</label>
										<span id="selectedFile"> no file selected. Drag and drop file or ... </span>
			                            <input type="file" id="files" name="files[]" multiple />
			                            <button id="getFile">choose file(s)</button>
								    </th>
								    <th >
								    	<label for="delimiterList">Delimiter</label>	
								    </th>
								    <th >
	                            		<select name="delimiterList" id="delimiterList" size="1"></select>
								    </th>
								  </tr>
								  <tr>
								    <td  ><label for="parsingName">Parsing Name</label></td>
								    <td  ><input type="text" id="parsingName" autocomplete="off"/></td>
								    <td  ><label for="machineName">Machine</label></td>
								    <td ><input type="text" id="machineName" autocomplete="off"/></td>
								  </tr>
								  <tr>
								    <td ><label for="parsingDescription">Parsing Description</label></td>
								    <td  colspan="3"><textarea rows="2" cols="100" id="parsingDescription" ></textarea> </td>
								  </tr>
								</table>
                    		</h4>
                    	</div>
                    </div>
                    <div id="plateTab">
                    	<h5>
	                        <label>
	                            Indicate the cell range that covers data for the first plate
	                            in the example file either by highlighting the relevant cells
	                            in the table to the left or by indicating the cell range in
	                            the field below.
	                        </label>
	                        <div>
	                            <label for="firstPlateCellRange">first plate cell range</label>
	                            <input type="text" id="firstPlateCellRange" autocomplete="off"/>
	                            <button id="applyFirstPlate">Apply</button>
	                        </div>
						</h5>
                    </div>
                    <div id="featuresTab">
                        <div>
                        	<h4>
                        		<table class="table" >
								  <tr >
								    <th colspan="8">
								    	<button class="btn btn-info btn-sm" id="newFeature">New feature</button>
			                            <button class="btn btn-info btn-sm" id="saveFeature">Add feature</button>
			                            <button class="btn btn-info btn-sm" id="deleteFeature">Delete feature</button>
			                            <button class="btn btn-info btn-sm" id="applyFeatures">Apply</button>
								    </th>
								  </tr>
								  <tr >
								   	<td ><label for="featureCellRange"> Cell Range</label></td>
								    <td ><input type="text" id="featureCellRange" autocomplete="off"/></td>
								    <td ><label for="featureLevel">Apply to</label></td>
								    <td id="featureLevel">
								    	<input type="radio" id="wellLevel" name="featureLevel" value="well" /> Well<br>
		                                <input type="radio" id="plateLevel" name="featureLevel" value="plate" /> Plate<br>
		                                <input type="radio" id="experimentLevel" name="featureLevel" value="experiment" /> Experiment
								    </td>
								    <td><label for="featureCategory">Category</label></td>
								    <td><input type="text" id="featureCategory" autocomplete="off"/></td>
								    <td><select name="featureList" id="featureList" size="5"><option>--features--</option></select></td>
								    <td><select name="labelList" id="labelList" size="5"><option>---labels---</option></select></td>
								  </tr>
								</table>	  
                        	</h4>
                        </div>
                    </div>
                    
                    <div id="plateIDSelection">
	                    <div>
	                    	<h5>
                        		<table class="table"  >
								  <tr >
								    <th colspan="8">
								    	<%--<button id="returnToConfig">Go back to parsing configuration</button>--%>
								    	<button class="btn btn-info btn-sm" id="sendImportDataToServer">Import and save the data</button>
	                    				<button class="btn btn-info btn-sm" id="downloadFileImport">Download file import</button>
								    </th>
								  </tr>
								  <tr  >
								    <td ><label for="experiment">Experiment</label></td>
								    <td colspan="3">
								    	<select id="experiment" name="experiment">
			                                <option value="">Experiment</option>
			                                 <g:each var="experiment" in="${ExperimentalPlateSet.findAllByOwner(Scientist.get(sec?.loggedInUserInfo(field:'id')))}">
			                                    <option value="${experiment.id}">${experiment.name}</option>
			                                </g:each>
			                            </select>
								    </td>
								    <td colspan="2" >&nbsp;</td>
								    <td colspan="2" ><select name="plateList" id="plateList" size="3"><option>--Plate List ---</option></select></td>
								  </tr>
								  <tr >
								  	<td colspan="8">
								  		<label for="plateIDMatchMethod">Plate ID match by &nbsp;&nbsp;&nbsp;  </label>
								    	<input type="radio" id="byFeature" name="plateIDMatchMethod" value="byFeature" /> Plate level feature &nbsp;&nbsp;&nbsp; 
	                                	<input type="radio" id="byManualEntry" name="plateIDMatchMethod" value="byManualEntry" /> Manual entry
								    </td>
								  </tr>  
								  <tr >
								  	<td  >&nbsp;</td>
								    <td colspan="6" >
								    	<br>
					                    <div id="byFeatureMethod">
					                        <p>
					                            Select a plate level feature to serve as the plate identifier
					                            for matching with the plates defined in the plate editor
					                        </p>
					                        <select name="plateLevelFeatureList" id="plateLevelFeatureList" size="3"><option>--Plate Level Feature List--<option></select>
					                    </div>
								    	<div id="byManualEntryMethod">
								    		<p>
					                            Enter a plate ID for each plate by selecting the plate in the
					                            plate list above and then entering the plate id for that plate
					                            in the field below and hitting the "set plate id" button.
					                        </p>    
					                        <select id="plateID" name="plateID"><option>--Plate ID--<option></select>
					                        <button class="btn btn-info btn-sm" id="setPlateID">Set Plate Id</button>
					                    </div>									    
								    </td>
								    <td >&nbsp;</td>
								  </tr>
								</table>	  
                        	</h5>
	                </div>
                </div>
          </div>      
	</div> <!--  END TABS -->
	
	
	<div class="col-sm-12"><div class="panel-body"></div></div>

	<div class="col-sm-12">
		<div id="gridPanel" class="panel panel-info">
			<div class="panel-heading">
				<h4 class="panel-title">Preview Output File</h4>
			</div>
			<div class="panel-body">
				<div id="myGrid" style="width:100%; height:600px;"></div>
			</div>
		</div>
	</div>

    <g:if env="production">
        <!-- Markup to include ONLY when in production -->
        <g:javascript>
            var hostname = "";      
        </g:javascript>
    </g:if>
    <g:else>
        <g:javascript>
            var hostname = "/capstone";       
        </g:javascript> 
    </g:else>

    <asset:javascript src="jquery-1.11.2.min.js"/>
	<asset:javascript src="jquery-ui.js"/>
	<asset:javascript src="jquery.event.drag-2.2.js"/>
	<asset:javascript src="grid/slick.core.js"/>
    <asset:javascript src="grid/slick.grid.js"/>
    <asset:javascript src="grid/slick.autotooltips.js"/>
    <asset:javascript src="grid/slick.cellrangedecorator.js"/>
    <asset:javascript src="grid/slick.cellrangeselector.js"/>
    <asset:javascript src="grid/slick.cellcopymanager.js"/>
    <asset:javascript src="grid/slick.cellselectionmodel.js"/>
    <asset:javascript src="grid/slick.editors.js"/>
    <asset:javascript src="selectize.js"/>
    <asset:javascript src="parser/CellRange.js"/>
    <asset:javascript src="grid/Grid.js"/>
    <asset:javascript src="parser/GridHighlighter.js"/>
    <asset:javascript src="parser/FileExaminer.js"/>
    <asset:javascript src="parser/ColorPicker.js"/>
    <asset:javascript src="parser/ImportData.js"/>
    <asset:javascript src="parser/ParsingConfig.js"/>
    <asset:javascript src="parser/ImportDataFileGenerator.js"/>
    <asset:javascript src="parser/DataExtractor.js"/>
    <asset:javascript src="parser/FlashMessenger.js"/>
    <asset:javascript src="parser/ServerCommunicator.js"/>
    <asset:javascript src="parser/ParserUI.js"/>
    <asset:javascript src="parser/ParsingController.js"/>


