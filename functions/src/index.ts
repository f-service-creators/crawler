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
    // change length by total data size at mirasapo
    const targetLength = 1100

    // delete all target settings
    const eventTime = new Date().toISOString()
    functions.logger.info(eventTime)
    for (let step = 0; step <= targetLength; step += 100) {
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
        limit: "100",
        order: "asc",
    }
    if (typeof offset === "string") {
        params["offset"] = offset
    }

    const query = new URLSearchParams(params)
    functions.logger.debug("before fetch offset:", offset)
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
        functions.logger.debug("after fetch offset:", offset)
        if (res.ok) {
            try {
                const original: subsidy.baseResponse = await res.json()
                // console.log(JSON.stringify(resJson));
                if (original.items.length > 0) {
                    Promise.all(
                        original.items.map(async (item) => {
                            const targetContent: subsidy.TargetContent = item
                            await admin
                                .firestore()
                                .collection("subsidy")
                                .doc(item.id)
                                .set(targetContent)
                        })
                    ).catch((error) => {
                        functions.logger.error(
                            "Error occur in writing to firestore. error msg is : ",
                            error
                        )
                    })
                    functions.logger.info(
                        "total data size is ",
                        String(original.total)
                    )
                } else {
                    functions.logger.debug("No data to write")
                }
                return original
            } catch (error) {
                functions.logger.error(
                    "Error occur in writing to firestore. error msg is : ",
                    error
                )
                throw new Error(
                    `Error occur in writing to firestore. error msg is : ${error}`
                )
            }
        } else {
            throw new Error("Response is NG")
        }
    } catch (error) {
        functions.logger.error(
            "Error occur in writing to firestore. error msg is : ",
            error
        )
        throw new Error(
            `Error occur in fetching data from outside. error msg is : ${error}`
        )
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

export const crawlByStoreWrite = functions
    .region("asia-northeast1")
    .firestore.document("crawler-target/{offset}")
    .onWrite(async (change, context) => {
        let offset = context.params.offset
        if (typeof offset !== "string") {
            offset = "0"
        }
        await crawlSite(offset)
        return null

        // const res = await crawlSite(offset)
        // functions.logger.debug(`write data ${JSON.stringify(res)}`)
    })
export const helloWorldCall = functions
    .region("asia-northeast1")
    .https.onRequest(async (request, response) => {
        await updateCrawlerTarget()
        response.json({ result: "success" })
    })
export const scheduledCall = functions
    .region("asia-northeast1")
    .pubsub.schedule("every 24 hours")
    .timeZone("Asia/Tokyo")
    .onRun(async () => {
        await updateCrawlerTarget()
        return null
    })
