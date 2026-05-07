const { addonBuilder, serveHTTP } = require("stremio-addon-sdk")

const manifest = {
    id: "org.onedeploy.iptv",
    version: "1.0.0",
    name: "IPTV BR OneClick",
    description: "Addon IPTV online para Stremio",
    resources: ["catalog", "meta", "stream"],
    types: ["tv"],
    catalogs: [
        {
            type: "tv",
            id: "brasil",
            name: "🇧🇷 TV Brasil"
        },
        {
            type: "tv",
            id: "esportes",
            name: "⚽ Esportes"
        }
    ]
}

const builder = new addonBuilder(manifest)

const canais = {
    brasil: [
        {
            id: "sbt",
            type: "tv",
            name: "SBT",
            poster: "https://logodownload.org/wp-content/uploads/2013/12/sbt-logo.png"
        }
    ],

    esportes: [
        {
            id: "sportv",
            type: "tv",
            name: "SporTV",
            poster: "https://upload.wikimedia.org/wikipedia/commons/4/4e/SporTV_logo_2021.png"
        }
    ]
}

builder.defineCatalogHandler(({ id }) => {
    return Promise.resolve({
        metas: canais[id] || []
    })
})

builder.defineMetaHandler(({ id }) => {

    for (const categoria in canais) {

        const canal = canais[categoria].find(c => c.id === id)

        if (canal) {
            return Promise.resolve({
                meta: canal
            })
        }
    }

    return Promise.resolve({ meta: {} })
})

builder.defineStreamHandler(({ id }) => {

    const streams = {
        sbt: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        sportv: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    }

    return Promise.resolve({
        streams: [
            {
                url: streams[id]
            }
        ]
    })
})

const PORT = process.env.PORT || 7000

serveHTTP(builder.getInterface(), { port: PORT })

console.log(`Addon online na porta ${PORT}`)