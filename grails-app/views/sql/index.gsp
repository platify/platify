<%--
  Created by IntelliJ IDEA.
  User: vinod.halaharvi@gmail.com
  Date: 4/8/16
  Time: 1:41 PM
--%>

<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page import="edu.harvard.capstone.editor.PlateSet; edu.harvard.capstone.editor.ExperimentalPlateSet" %>
<html>
<head>
  <meta name="layout" content="main">
  <title>SQL plugin</title>
  <asset:stylesheet href="jquery-ui.css"/>
</head>

<body>

<div align="center">
  <form id="target" action="/platify/sql/index/" method="POST">
    <fieldset align="right" style="width: 40%;">
      <legend>Enter SQL to run on platify Database:</legend>
      SQL
      <br>
      <textarea name="sql" id="sql" cols="30" rows="10"></textarea>
      <br />
      <input type="submit" name="submit" id="submit" />
      <br />
    </fieldset>
  </form>
</div>


<p></p>


<div>
  <g:if test="${results != null}">

    <table align="center" border="1px">
      <thead>

      <g:each in="${results[0].keySet()}" var="data">
        <td>${data}</td>
      </g:each>
      </thead>
      <tbody>
      <g:each in="${results}" var="row">
        <tr>
          <g:each in="${row.values()}" var="value">
            <td>${value}</td>
          </g:each>
        </tr>
      </g:each>
      </tbody>

    </table>
  </g:if>


</div>
</body>
</html>