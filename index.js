const fs = require("fs")
const parser = require("iptv-playlist-parser")
const { addonBuilder, serveHTTP } = require("stremio-addon-sdk")

// LER ARQUIVO M3U
const playlist = fs.readFileSync("./lista.m3u8", "utf8")
const parsed = parser.parse(playlist)

// PEGAR CATEGORIAS
const categoriasMap = {}

parsed.items.forEach(item => {

    const categoria = item.group?.title || "Outros"

    if (!categoriasMap[categoria]) {
        categoriasMap[categoria] = []
    }

    categoriasMap[categoria].push({
        id: item.name.replace(/\s+/g, "_").toLowerCase(),
        type: "tv",
        name: item.name,
        poster: item.tvg?.logo || "https://via.placeholder.com/300x450.png?text=TV"
    })
})

// GERAR CATALOGOS
const catalogs = Object.keys(categoriasMap).map(cat => ({
    type: "tv",
    id: cat,
    name: cat
}))

const manifest = {
    id: "org.auto.m3u",
    version: "2.0.0",
    name: "IPTV Auto Categorias",
    description: "Addon automático para listas M3U",
    resources: ["catalog", "meta", "stream"],
    types: ["tv"],
    catalogs
}

const builder = new addonBuilder(manifest)

// CATALOGOS
builder.defineCatalogHandler(({ id }) => {

    return Promise.resolve({
        metas: categoriasMap[id] || []
    })
})

// META
builder.defineMetaHandler(({ id }) => {

    for (const categoria in categoriasMap) {

        const canal = categoriasMap[categoria].find(c => c.id === id)

        if (canal) {
            return Promise.resolve({
                meta: canal
            })
        }
    }

    return Promise.resolve({ meta: {} })
})

// STREAMS
builder.defineStreamHandler(({ id }) => {

    let streamUrl = null

    parsed.items.forEach(item => {

        const itemId = item.name.replace(/\s+/g, "_").toLowerCase()

        if (itemId === id) {
            streamUrl = item.url
        }
    })

    return Promise.resolve({
        streams: streamUrl ? [{ url: streamUrl }] : []
    })
})

const PORT = process.env.PORT || 7000

serveHTTP(builder.getInterface(), { port: PORT })

console.log("Addon online na porta " + PORT)