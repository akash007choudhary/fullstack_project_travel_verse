# Mapbox Integration – Travel Verse

## 1. Feature Overview

Integrated **Mapbox** into the Travel Verse project to display the geographical location of property listings through interactive maps.

### Features

* Displays the actual geographical location of each listing.
* Shows a marker indicating the property's location.
* Supports interactive map navigation and zooming.
* Uses stored geographical coordinates instead of repeatedly geocoding locations.

## 2. Technologies Used

| Technology           | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| Mapbox Geocoding API | Converts location names into geographical coordinates. |
| Mapbox GL JS         | Displays interactive maps.                             |
| MongoDB              | Stores geographical coordinates.                       |
| Mongoose             | Defines the GeoJSON geometry schema.                   |
| EJS                  | Passes dynamic listing data to the frontend.           |
| JavaScript           | Initializes the map and adds markers.                  |

## 3. Working Process

### Step 1: Geocoding – Converting Location into Coordinates

When a user creates a listing, they provide:

* Location
* Country

A map requires geographical coordinates rather than just location names.

For this, I use the **Mapbox Geocoding API**.

```js
let response = await geocodingClient.forwardGeocode({
    query: `${newListing.location}, ${newListing.country}`,
    limit: 1,
    mode: "mapbox.places-permanent"
}).send();
```

**Explanation:**

* `query`: Sends the location and country to Mapbox.
* `limit: 1`: Requests one matching result.
* `send()`: Sends the API request.
* Mapbox returns geographical coordinates.

Example:

```js
[85.8315, 20.2961]
```

**Important:** Mapbox uses `[longitude, latitude]` order.

### Step 2: Storing Coordinates in MongoDB

After receiving coordinates, I store them in the listing document using GeoJSON format.

```js
newListing.geometry = {
    type: "Point",
    coordinates: coordinates
};
```

Mongoose Schema:

```js
geometry: {
    type: {
        type: String,
        enum: ["Point"]
    },
    coordinates: {
        type: [Number]
    }
}
```

Example MongoDB document:

```js
{
    location: "Sambalpur",
    country: "India",
    geometry: {
        type: "Point",
        coordinates: [83.9750, 21.4669]
    }
}
```

### Step 3: Geocoding Initial Sample Data

Initially, predefined sample listings did not contain geographical coordinates.

To solve this, I integrated Mapbox Geocoding into `init/index.js`.

For every sample listing:

1. Read its location and country.
2. Send a geocoding request to Mapbox.
3. Receive longitude and latitude.
4. Add the coordinates in GeoJSON format.
5. Insert the updated listings into MongoDB.

I used `Promise.all()` to process multiple geocoding requests asynchronously.

### Step 4: Passing Data from Backend to Frontend

When a user opens a listing, the `showListing` controller fetches the listing details from MongoDB.

```js
const user = await listing.findById(id)
    .populate("reviews")
    .populate("owner");

res.render("./listings/show.ejs", { user });
```

In `show.ejs`, I pass the coordinates and Mapbox token using HTML data attributes.

```ejs
<div
    id="map"
    data-coordinates='<%= JSON.stringify(user.geometry.coordinates) %>'
    data-token="<%= MAP_TOKEN %>"
></div>
```

**Why use data attributes?**

They allow me to pass dynamic EJS values to an external JavaScript file without writing EJS code inside that file.

### Step 5: Displaying the Interactive Map

In `public/js/map.js`:

**1. Get the map container**

```js
const mapDiv = document.getElementById("map");
```

**2. Set the Mapbox access token**

```js
mapboxgl.accessToken = mapDiv.dataset.token;
```

**3. Retrieve coordinates**

```js
const coordinates = JSON.parse(mapDiv.dataset.coordinates);
```

**4. Initialize the map**

```js
const map = new mapboxgl.Map({
    container: "map",
    center: coordinates,
    zoom: 9
});
```

**5. Add a marker**

```js
const marker = new mapboxgl.Marker({
    color: "#fe424d"
})
    .setLngLat(coordinates)
    .addTo(map);
```

This displays a red marker at the geographical location of the listing.

## 4. Complete Architecture / Data Flow

```text
        USER CREATES LISTING
                 |
                 v
         Location + Country
                 |
                 v
        MAPBOX GEOCODING API
                 |
                 v
        Longitude + Latitude
                 |
                 v
          GEOJSON FORMAT
                 |
                 v
          MONGODB DATABASE
                 |
                 v
       SHOW LISTING CONTROLLER
                 |
                 v
         EJS DATA ATTRIBUTES
                 |
                 v
       FRONTEND JAVASCRIPT
                 |
                 v
            MAPBOX GL JS
                 |
                 v
      INTERACTIVE MAP + MARKER
```

## 5. Important Interview Questions

### Q1. What is Geocoding?

Geocoding is the process of converting a human-readable address or location name into geographical coordinates (latitude and longitude).

### Q2. Why did you use Mapbox?

Mapbox provides customizable interactive maps, geocoding capabilities and JavaScript integration.

### Q3. What is GeoJSON?

GeoJSON is a format used to represent geographical data. In my project, I use a GeoJSON Point to store the longitude and latitude of each listing.

### Q4. Why store coordinates in MongoDB?

Storing coordinates avoids making a new geocoding API request every time a user opens a listing. The application retrieves the already-stored coordinates.

### Q5. Difference between Geocoding API and Mapbox GL JS?

* **Geocoding API:** Converts location names into geographical coordinates.
* **Mapbox GL JS:** Uses geographical coordinates to display an interactive map.

### Q6. Why use JSON.stringify() and JSON.parse()?

* `JSON.stringify()` converts the coordinates array into a string for the HTML data attribute.
* `JSON.parse()` converts that string back into a JavaScript array.

### Q7. Why use environment variables for the Mapbox token?

Environment variables avoid hardcoding configuration values in the source code. The public Mapbox token is passed to the frontend when required. Since it is browser-facing, it should have suitable URL restrictions and permissions.

## 6. 45-Second Placement Explanation

> In my Travel Verse project, I integrated Mapbox to display the geographical location of property listings.
>
> First, when a user creates a listing, I take the location and country and send them to the Mapbox Geocoding API. It returns longitude and latitude, which I store in MongoDB using the GeoJSON Point format.
>
> When a user opens a listing, the backend fetches its geographical coordinates and passes them to the EJS frontend using HTML data attributes.
>
> Then, using Mapbox GL JS, I initialize an interactive map, set its center using the stored coordinates and add a marker at that location.
>
> I also integrated geocoding into my initial sample data initialization so that predefined listings have coordinates as well.

## 7. Most Important Concepts to Remember

| Concept            | Meaning                                           |
| ------------------ | ------------------------------------------------- |
| Geocoding          | Location name → Coordinates                       |
| GeoJSON            | Format for storing geographical data              |
| Longitude          | East-West geographical position                   |
| Latitude           | North-South geographical position                 |
| Mapbox GL JS       | Displays interactive maps                         |
| Marker             | Indicates a particular geographical location      |
| `Promise.all()`    | Handles multiple asynchronous operations together |
| `JSON.stringify()` | Converts JavaScript data into JSON string         |
| `JSON.parse()`     | Converts JSON string into JavaScript data         |

### Final Takeaway

**Geocoding API = Location name → Coordinates**

**Mapbox GL JS = Coordinates → Interactive Map**

The complete feature follows this flow:

**User Input → Geocoding → MongoDB → Backend → EJS → JavaScript → Interactive Map.**
