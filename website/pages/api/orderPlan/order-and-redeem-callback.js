import { validateEncStr } from "@/lib/validateEncStr";
import { prisma } from "@/lib/db/prisma";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        console.error("Invalid request method");
        res.setHeader('Allow', 'POST');
        return res.status(405).send("Method Not Allowed");
    }

    console.log(req.body)

    if (!validateEncStr(req.body)) {
        console.error("Invalid encStr in callback data");
        return res.status(400).send("Invalid encStr");
    }

    const { orderId, itemList } = req.body;

    if (!orderId || !Array.isArray(itemList) || itemList.length === 0) {
        console.error("Missing orderId or itemList in callback data");
        return res.status(400).send("Missing orderId or itemList");
    }

    const orders = await prisma.planOrder.findMany({
        where: { orderId },
    });

    // For each item in itemList, find a matching order (by productId) that hasn't been updated yet
    const usedOrderIds = new Set();
    await Promise.all(
        itemList.map(async (item) => {
            const MatchingOrder = orders.find( order => order.productId === item.productId && !usedOrderIds.has(order.id))
            if (MatchingOrder) {
                usedOrderIds.add(MatchingOrder.id);
                await prisma.planOrder.update({
                    where: { id: MatchingOrder.id },
                    data: {
                        qrLink: item.qrcode,
                        lpa: item.qrcodeContent
                    }
                });
            }
        })
    );

    return res.status(200).send("1");
}

// add sending email to user with qr code and lpa
//check - why I get "all is fine" in success if there was an error



// api returns:
/*
Body: {
  orderId: 'b00005c2510030001',
  itemList: [
    {
      iccid: '89862100079403062984',
      productName: 'Japan, 1 Day, 1GB',
      qrcode: 'https://tfmshippingsys.fastmove.com.tw/tApi/images/redeem_sample.jpg',
      rcode: '39qW0v84dA',
      qrcodeType: 2,
      resultcode: '000',
      resultmsg: 'success',
      code: 0,
      msg: '成功',
      qrcodeContent: 'LPA:1$rsp.demo.com$0913F6176020B7C603E3R42B61P686D3',
      salePlanDays: 2,
      pin1: '1111',
      pin2: '2222',
      puk1: '33334444',
      puk2: '44445555',
      cfCode: '849372',
      apnExplain: 'rsp.demo.com'
    }
  ],
  encStr: '14cfcaf0baa1b3123dce8027ba48e99f77752ad0'
}
  */