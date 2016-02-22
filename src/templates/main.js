
exports.up = function(knex, Promise) {
  return knex.schema
{% block up %}{% endblock %}
};

exports.down = function(knex, Promise) {
  return knex.schema
{% block down %}{% endblock %}
};

{% block content %}
{% endblock %}