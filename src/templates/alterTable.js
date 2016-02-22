{% extends "main.js" %}

{% block up %}
    .table('{{ tableName }}', {{ tableName }}_up);
{% endblock %}

{% block down %}
    .table('{{ tableName }}', {{ tableName }}_down);
{% endblock %}

{% block content %}
function {{ tableName }}_up(table) {
{% for column in addColumns %}
  table{{ columnToString(column) }};
{% endfor %}
{% for column in dropColumns %}
  table.dropColumn('{{ column.name }}');
{% endfor %}
}

function {{ tableName }}_down(table) {
{% for column in dropColumns %}
  table{{ columnToString(column) }};
{% endfor %}
{% for column in addColumns %}
  table.dropColumn('{{ column.name }}');
{% endfor %}
}
{% endblock %}