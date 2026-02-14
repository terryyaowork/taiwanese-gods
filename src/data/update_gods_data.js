const fs = require('fs');
const path = require('path');

const godsPath = '/Users/terryyao/work/prd/taiwanese-gods/src/data/taoist-gods.json';
const gods = JSON.parse(fs.readFileSync(godsPath, 'utf8'));

const imageUpdates = {
    'chenghuang': '/assets/images/gods/chenghuang.jpeg',
    'baosheng': '/assets/images/gods/baosheng.jpg',
    'xuantian': '/assets/images/gods/xuantianshangdi.jpeg'
};

const processedGods = gods.map(god => {
    // Update image if needed
    if (imageUpdates[god.id]) {
        god.image = imageUpdates[god.id];
    }

    // Add Google Maps link to temples
    if (god.temples && god.temples.length > 0) {
        god.temples = god.temples.map(temple => {
            // If mapUrl already exists, keep it (though unlikely as we are adding it now)
            if (!temple.mapUrl) {
                const query = encodeURIComponent(temple.name['zh-TW']);
                temple.mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
            }
            return temple;
        });
    }
    return god;
});

fs.writeFileSync(godsPath, JSON.stringify(processedGods, null, 2));
console.log('Taoist gods data updated successfully!');
