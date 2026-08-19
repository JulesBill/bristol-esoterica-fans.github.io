import urllib.request
from bs4 import BeautifulSoup
import yaml
import sys
import os

URL = 'https://www.ukclimbing.com/logbook/latest_ascents.php'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def main():
    try:
        req = urllib.request.Request(URL, headers=HEADERS)
        with urllib.request.urlopen(req) as response:
            html = response.read()
    except Exception as e:
        print(f"Error fetching UKC: {e}")
        sys.exit(1)

    soup = BeautifulSoup(html, 'html.parser')
    tables = soup.find_all('table')
    
    if not tables:
        print("No tables found on the page.")
        sys.exit(0)

    # The first table should be the ascents table
    table = tables[0]
    
    # Load target crag keywords
    target_keywords = ["cheddar", "avon"]
    filters_file = os.path.join('_data', 'crag_filters.yml')
    if os.path.exists(filters_file):
        with open(filters_file, 'r', encoding='utf-8') as f:
            filters_data = yaml.safe_load(f)
            if filters_data and 'keywords' in filters_data:
                target_keywords = [k.lower() for k in filters_data['keywords']]

    local_ascents = []

    for row in table.find_all('tr'):
        cells = row.find_all('td')
        if len(cells) < 6:
            continue
            
        climb_name_tag = cells[0].find('a')
        climb_name = climb_name_tag.text.strip() if climb_name_tag else cells[0].text.strip()
        climb_url = climb_name_tag['href'] if climb_name_tag and 'href' in climb_name_tag.attrs else ''
        
        grade = cells[1].text.strip()
        style = cells[2].text.strip()
        
        climber_tag = cells[3].find('a')
        climber = climber_tag.text.strip() if climber_tag else cells[3].text.strip()
        
        date = cells[4].text.strip()
        
        crag_name_tag = cells[5].find('a')
        crag_name = crag_name_tag.text.strip() if crag_name_tag else cells[5].text.strip()
        crag_url = crag_name_tag['href'] if crag_name_tag and 'href' in crag_name_tag.attrs else ''

        crag_name_lower = crag_name.lower()
        if any(keyword in crag_name_lower for keyword in target_keywords):
            if climb_url and climb_url.startswith('/'):
                climb_url = 'https://www.ukclimbing.com' + climb_url
            if crag_url and crag_url.startswith('/'):
                crag_url = 'https://www.ukclimbing.com' + crag_url
                
            local_ascents.append({
                'climb_name': climb_name,
                'climb_url': climb_url,
                'grade': grade,
                'style': style,
                'climber': climber,
                'date': date,
                'crag_name': crag_name,
                'crag_url': crag_url
            })
            
    print(f"Parsed {len(table.find_all('tr'))} rows from UKC.")
    print(f"Found {len(local_ascents)} local ascents matching keywords.")

    # Read existing data to prepend or just replace? Let's just replace with the latest fetched.
    # Since this is "latest ascents", maybe we should merge them to build a historical list.
    # For now, let's just output the ones we found.
    
    data_dir = '_data'
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        
    output_file = os.path.join(data_dir, 'latest_local_ascents.yml')
    
    existing_ascents = []
    if os.path.exists(output_file):
        with open(output_file, 'r', encoding='utf-8') as f:
            loaded = yaml.safe_load(f)
            if loaded:
                existing_ascents = loaded

    # Merge new ascents, keeping unique climb_name + climber + date combinations
    seen = set(f"{a['climb_name']}-{a['climber']}-{a['date']}" for a in existing_ascents)
    
    added_count = 0
    # Add new ones at the beginning
    for ascent in local_ascents:
        key = f"{ascent['climb_name']}-{ascent['climber']}-{ascent['date']}"
        if key not in seen:
            existing_ascents.insert(0, ascent)
            seen.add(key)
            added_count += 1
            
    # Keep only the last 50 ascents so the file doesn't grow infinitely
    # existing_ascents = existing_ascents[:50]

    if added_count > 0:
        with open(output_file, 'w', encoding='utf-8') as f:
            yaml.dump(existing_ascents, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
        print(f"Added {added_count} new local ascents.")
    else:
        print("No new local ascents found.")

if __name__ == "__main__":
    main()
