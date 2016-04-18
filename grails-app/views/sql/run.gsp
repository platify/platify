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
  <asset:stylesheet href="grid/style.css"/>
  <asset:stylesheet href="grid/slick.grid.css"/>
  <asset:stylesheet href="grid/slick-default-theme.css"/>
  <asset:stylesheet href="grid/Grid.css"/>
</head>

<body>
<table>
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
</body>
</html>