# TimesheetApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**addTimesheetEntry**](#addtimesheetentry) | **POST** /timesheets | Add a new timesheet entry|
|[**getTimesheetEntry**](#gettimesheetentry) | **GET** /timesheets/{id} | Get a timesheet entry|
|[**timesheetsList**](#timesheetslist) | **GET** /timesheets | Get the list of timesheet entries|
|[**updateTimesheetEntry**](#updatetimesheetentry) | **PUT** /timesheets/{id} | Update a timesheet entry|

# **addTimesheetEntry**
> TimesheetEntry addTimesheetEntry(timesheetEntry)


### Example

```typescript
import {
    TimesheetApi,
    Configuration,
    TimesheetEntry
} from './api';

const configuration = new Configuration();
const apiInstance = new TimesheetApi(configuration);

let timesheetEntry: TimesheetEntry; //

const { status, data } = await apiInstance.addTimesheetEntry(
    timesheetEntry
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **timesheetEntry** | **TimesheetEntry**|  | |


### Return type

**TimesheetEntry**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Timesheet entry created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getTimesheetEntry**
> TimesheetEntry getTimesheetEntry()


### Example

```typescript
import {
    TimesheetApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TimesheetApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getTimesheetEntry(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**TimesheetEntry**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Timesheet entry found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **timesheetsList**
> Array<TimesheetEntry> timesheetsList()


### Example

```typescript
import {
    TimesheetApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TimesheetApi(configuration);

const { status, data } = await apiInstance.timesheetsList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<TimesheetEntry>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of timesheet entries |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateTimesheetEntry**
> TimesheetEntry updateTimesheetEntry(timesheetEntry)


### Example

```typescript
import {
    TimesheetApi,
    Configuration,
    TimesheetEntry
} from './api';

const configuration = new Configuration();
const apiInstance = new TimesheetApi(configuration);

let id: string; // (default to undefined)
let timesheetEntry: TimesheetEntry; //

const { status, data } = await apiInstance.updateTimesheetEntry(
    id,
    timesheetEntry
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **timesheetEntry** | **TimesheetEntry**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**TimesheetEntry**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Timesheet entry updated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

