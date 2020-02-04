import { HttpClient } from '@angular/common/http';
import { IPgConfig } from './pg.config';

export class PgBaseService<T>
{
    public baseUrl = "";
    public url:string = "_blank";
    public httpClient:HttpClient;

    // Search
    protected _searchText:string;
    protected _searchIn:string;
    protected _perPage:number = 100;
    protected _currentPage:number = 1;
    protected _customQueryString;

    // Order
    protected _order:string;
    protected _orderBy:string;

    // Item
    protected _item:T;
    protected _items:T[];

    // Paginate
    protected _pagination:IPgBasePagination<T>;

    constructor(client:HttpClient, config:IPgConfig)
    {
        this.httpClient = client;
        this.baseUrl = config.baseUrl;
    }

    public all() : Promise<T[]>
    {
        return new Promise((resolve, reject) => {
            this.httpClient.get<T[]>(this.baseUrl + this.url).toPromise().then(
                res => {
                    this._items = res;
                    resolve(res);
                },
                err => reject(err)
            );
        });
    }
    public pagination() :  Promise<IPgBasePagination<T>>
    {
        return new Promise((resolve, reject) => {
            this.httpClient.get<IPgBasePagination<T>>(this.baseUrl + this.url + this.queryString + "&paginate=1").toPromise().then(
                res => {
                    this._items = res.data;
                    this._pagination = res;

                    resolve(res);
                },
                err => reject(err)
            );
        });
    }
    public previousPage() : Promise<IPgBasePagination<T>>
    {
        this._currentPage = this._currentPage <= 1 ? this._pagination.last_page : this._currentPage - 1;
        return this.pagination();
    }
    public nextPage() : Promise<IPgBasePagination<T>>
    {
        this._currentPage = this._currentPage >= this._pagination.last_page ? 0 : this._currentPage + 1;
        return this.pagination();
    }
    public openPage(value:number) : Promise<IPgBasePagination<T>>
    {
        this._currentPage = value;
        return this.pagination();
    }
    public perPage(value:number)
    {
        this._perPage = value;
        return this;
    }
    public currentPage(value:number)
    {
        this._currentPage = value;
        return this;
    }
    public search(value:string)
    {
        this._searchText = value;
        return this;
    }
    public in(value:string)
    {
        this._searchIn = value;
        return this;
    }
    public order(value:string)
    {
        this._order = value;
        return this;
    }
    public orderBy(value:string)
    {
        this._orderBy = value;
        return this;
    }
    public clearQuery()
    {
        this._perPage = 100;
        this._currentPage = 1;
        this._searchText = null;
        this._searchIn = null;
        this._order = null;
        this._orderBy = null;
    }
    public clearItem()
    {
        this.item = null;
    }
    public clearItems()
    {
        this.items = null;
    }

    public get queryString() : string
    {
        let queryString = "?method=get";
        if(this._searchText) queryString += "&keyword=" + this._searchText;
        if(this._searchIn) queryString += "&in=" + this._searchIn;
        if(this._order) queryString += "&order=" + this._order;
        if(this._orderBy) queryString += "&orderBy=" + this._orderBy;
        if(this._perPage) queryString += "&per_page=" + this._perPage;
        if(this._currentPage) queryString += "&page=" + this._currentPage;
        if(this._customQueryString) queryString += "&" + this._customQueryString;

        return queryString;
    }

    public get() : Promise<T[]>
    {
        return new Promise((resolve, reject) => {
            this.httpClient.get<T[]>(this.baseUrl + this.url + this.queryString).toPromise().then(
                res => {
                    this._items = res;
                    resolve(res);
                },
                err => reject(err)
            );
        });
    }
    
    public show(id:number) : Promise<T>
    {
        return new Promise((resolve, reject) => {
            this.httpClient.get<T>(this.baseUrl + this.url + "/" + id.toString()).toPromise().then(
                res => {
                    this._item = res;
                    resolve(res);
                },
                err => reject(err)
            );
        });
    }
    public create(value:T = null) : Promise<T>
    {
        // Set value
        if(value != null) this._item = value;
        // Request Create
        return new Promise((resolve, reject) => {
            this.httpClient.post<T>(this.baseUrl + this.url, this._item).toPromise().then(
                res => {
                    this._item = res;
                    resolve(res);
                },
                err => reject(err)
            );
        });
    }
    public update(value:T = null) : Promise<T>
    {
        // Set value
        if(value != null) this._item = value;

        // Request Update
        return new Promise((resolve, reject) => {
            this.httpClient.put<T>(this.baseUrl + this.url + "/" + this._item["id"].toString(), this._item).toPromise().then(
                res => {
                    this._item = res;
                    resolve(res);
                },
                err => reject(err)
            );
        });
    }
    public delete(id:number = null) : Promise<boolean>
    {
        // Set value
        if(id == null) id = this._item["id"];

        // Request Update
        return new Promise((resolve, reject) => {
            this.httpClient.delete(this.baseUrl + this.url + "/" + id.toString(), {
                responseType: "text"
            }).toPromise().then(
                res => {
                    resolve(true);
                },
                err => reject(err)
            );
        });
    }

    public get item():T { return this._item; }
    public set item(value:T) { this._item = value; }
    public get items():T[] { return this._items; }
    public set items(value:T[]) { this._items = value; }

    public save(value:T = null) : Promise<T>
    {
        // Set value
        if(value == null) value = this._item;

        // Request 
        if(typeof(value["id"]) !== "undefined" && value["id"])
            return this.update(value);
        else
            return this.create(value);
    }


}
export interface IPgBasePagination<T>
{
    total:number;
    per_page:number;
    current_page:number;
    last_page:number;
    from:number;
    to:number;
    data:T[];
}