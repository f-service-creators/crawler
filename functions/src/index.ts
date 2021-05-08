import * as functions from "firebase-functions"
// import './@types/subsidy'
import * as admin from "firebase-admin"
import Global = NodeJS.Global
export interface GlobalWithCognitoFix extends Global {
    fetch: any
}
declare const global: GlobalWithCognitoFix
global.fetch = require("node-fetch")
admin.initializeApp()

// define function
const updateCrawlerTarget = async () => {
    const targetLength = 1020
    // delete all target settings
    const eventTime = new Date().toISOString()
    functions.logger.info(eventTime)
    for (let step = 0; step <= targetLength; step += 20) {
        await admin
            .firestore()
            .collection("crawler-target")
            .doc(String(step))
            .set({ timestamp: eventTime })
        functions.logger.info(`Update record ${String(step)}`)
    }
}

const crawlSite = async (offset: string) => {
    const params: Record<string, string> = {
        sort: "timestamp",
        limit: "20",
        order: "asc",
    }
    if (typeof offset === "string") {
        params["offset"] = offset
    }

    const query = new URLSearchParams(params)
    console.log("before fetch")
    try {
        const res = await fetch(
            `https://jirei-seido-api.mirasapo-plus.go.jp/supports?${query}`,
            {
                method: "GET",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        )
        console.log("after fetch")
        if (res.ok) {
            const original: subsidy.baseResponse = await res.json()
            // console.log(JSON.stringify(resJson));
            original.items.forEach(async (item) => {
                const targetContent: subsidy.TargetContent = item
                await admin
                    .firestore()
                    .collection("subsidy")
                    .doc(item.id)
                    .set(targetContent)
            })
            return original
        } else {
            throw new Error("Response is NG")
        }
    } catch (error) {
        functions.logger.error(error)
        throw new Error(`Error happen ${error}`)
    }
}

export const helloWorld = functions
    .region("asia-northeast1")
    .https.onRequest(async (request, response) => {
        const original = request.query.text
        const writeResult = await admin
            .firestore()
            .collection("messages")
            .add({ original: original })
        functions.logger.info("Hello logs!", { structuredData: true })
        response.json({
            result: `Message with ID: ${writeResult.id} added!`,
        })
    })

export const crawlByApi = functions
    .region("asia-northeast1")
    .https.onRequest(async (request, response) => {
        let offset = request.query.offset
        if (typeof offset !== "string") {
            offset = "0"
        }
        const res = await crawlSite(offset)
        response.json(res)
    })
export const helloWorldCall = functions
    .region("asia-northeast1")
    .https.onRequest(async (request, response) => {
        await updateCrawlerTarget()
        response.json({ result: "success" })
    })
export const scheduledCall = functions.pubsub
    .schedule("every 24 hours")
    .timeZone("Asia/Tokyo")
    .onRun(async (context) => {
        await updateCrawlerTarget()
    })
