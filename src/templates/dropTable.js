{% extends "main.js" %}

{% block up %}
    .dropTable('{{ tableName }}');
{% endblock %}

{% block down %}
    .createTable('{{ tableName }}', {{ tableName }});
{% endblock %}

{% block content %}
function {{ tableName }}(table) {
{% for column in columns %}
  table{{ columnToString(column) }};
{% endfor %}
}
{% endblock %}