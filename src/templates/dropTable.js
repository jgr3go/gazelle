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

{% for index in indexes %}
  table{{ indexToString(index) }}
{% endfor %}

{% for unique in uniques %}
  table{{ uniqueToString(unique) }}
{% endfor %}
}
{% endblock %}