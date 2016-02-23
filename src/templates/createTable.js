{% extends "main.js" %}

{% block up %}
    .createTable('{{ tableName }}', {{ tableName }});
{% endblock %}

{% block down %}
    .dropTable('{{ tableName }}');
{% endblock %}

{% block content %}
function {{ tableName }}(table) {
{% for column in columns %}
  table{{ columnToString(column) }};
{% endfor %}

{% for index in indexes %}
  table{{ indexToString(index) }};
{% endfor %}

{% for unique in uniques %}
  table{{ uniqueToString(unique) }};
{% endfor %}
}
{% endblock %}