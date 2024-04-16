// Some locations are not coming directly from API and could be fetched through resource field


export function getElementFromField(field: string, key: string) {
    const arr = field.split('/')
    for (let i = 0; i < arr.length-1; i++) {
        if (arr[i] == key) {
            return arr[i+1]
        }
    }
    return ""
}

export function isZonalLocation(field: string) {
    const arr = field.split('-') // zone is us-east1-c and region is us-east1
    if (arr.length >= 3) {
        return true
    }
    return false
}

export function setRegion(field: string) {
    const arr = field.split('-') // zone is us-east1-c and region is us-east1
    let region:string = ""
    if (arr.length >= 2) {
        region = arr[0] + "-" + arr[1]
    }
    return region
}