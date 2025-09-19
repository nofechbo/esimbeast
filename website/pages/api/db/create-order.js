import { prisma } from "@/lib/db/prisma";


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const {
            orderId,
            email,
            productId,
            productName,
            countryCodes,
            data,
            duration,
            price,
        } = req.body

        const newOrder = await prisma.planOrder.create({
            data: {
                orderId,
                email,
                productId,
                productName,
                countryCodes,
                data,
                duration,
                price,
                orderTime: new Date()
            }
        })

        res.status(201).json(newOrder)

    } catch (err) {
        console.error('Error creating order:' , err)
        res.status(500).json({ error: 'Failed to create order'})
    }
}