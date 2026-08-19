---
title: Latest Local Ascents
permalink: /local-ascents/
layout: page
comments: false
---

A live feed of recent (successful) climbs logged at Cheddar, Avon, Brean, and other local crags. Data is fetched automatically from UKC every 4 hours.
See if you can spot your favourite wad.

<div class="overflow-table" style="margin-top: 2rem;">
  <table>
    <thead>
      <tr>
        <th>Climb</th>
        <th>Grade</th>
        <th>Style</th>
        <th>Climber</th>
        <th>Crag</th>
      </tr>
    </thead>
    <tbody>
      {% assign current_date = "" %}
      {% for ascent in site.data.latest_local_ascents %}
        {% if ascent.date != current_date %}
          <tr style="background: rgba(128,128,128,0.08);">
            <td colspan="5" style="font-weight: bold; text-align: center; padding: 0.6rem; font-size: 0.95rem; opacity: 0.8;">
              🗓️ {{ ascent.date }}
            </td>
          </tr>
          {% assign current_date = ascent.date %}
        {% endif %}
        <tr>
          <td>
            {% if ascent.climb_url != "" %}<a href="{{ ascent.climb_url }}" target="_blank" rel="noopener">{% endif %}
            {{ ascent.climb_name }}
            {% if ascent.climb_url != "" %}</a>{% endif %}
          </td>
          <td style="white-space: nowrap; font-size: 0.85rem;">{{ ascent.grade }}</td>
          <td style="font-size: 0.85rem;">{{ ascent.style }}</td>
          <td><strong>{{ ascent.climber }}</strong></td>
          <td style="font-size: 0.9rem;">
            {% if ascent.crag_url != "" %}<a href="{{ ascent.crag_url }}" target="_blank" rel="noopener">{% endif %}
            {{ ascent.crag_name }}
            {% if ascent.crag_url != "" %}</a>{% endif %}
          </td>
        </tr>
      {% endfor %}
      
      {% if site.data.latest_local_ascents == nil or site.data.latest_local_ascents.size == 0 %}
        <tr>
          <td colspan="5" style="text-align: center; font-style: italic; opacity: 0.6; padding: 2rem;">
            No recent ascents found yet. Check back soon!
          </td>
        </tr>
      {% endif %}
    </tbody>
  </table>
</div>
