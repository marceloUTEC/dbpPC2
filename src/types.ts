export interface CampusLocation {
  id: number
  name: string
  description: string
  building: string
  floor: number
  status: string
}

export interface LocationPage {
  items: CampusLocation[]
  page: number
  size: number
  totalItems: number
  totalPages: number
}

export interface Ticket {
  id: number
  resourceId: number
  resourceName: string
  description: string
  status: 'OPEN' | 'CLOSED'
}
