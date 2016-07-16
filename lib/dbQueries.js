
//////////////////////////////////////////////////////////////////////

exports.queryUsers = function(db, finalCallback)
{
    var collection  = db.get(process.env.AOTD_DB_COLLECTION_USERS);

    collection.find( {
                         $query: { "IsEmailRecipient": { $eq:true }  }
                     },

                     {},

                     finalCallback); // @finalCallback = function(err, docs)
};

//////////////////////////////////////////////////////////////////////

exports.queryAlbums = function(db, dtStart, dtEnd, finalCallback)
{
    var collection = db.get(process.env.AOTD_DB_COLLECTION_ALBUMS);

    collection.find( {
                         $query:   { "RecommendedOn": { $gte:dtStart, $lte:dtEnd }  },
                         $orderby: { "Order":-1 } // -1 = Descending
                     },

                     {},

                     finalCallback); // @finalCallback = function(err, docs)
};

//////////////////////////////////////////////////////////////////////
